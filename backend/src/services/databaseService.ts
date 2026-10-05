import { Pool } from 'pg';
// @ts-ignore
import pgvector from 'pgvector/pg';
import { config } from '../config/env';
import { DocumentChunk } from '../types/semantic';

let pool: Pool | null = null;

export async function isDatabaseAvailable(): Promise<boolean> {
  if (!config.databaseUrl) return false;
  try {
    const p = await getPool();
    const client = await p.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function getPool(): Promise<Pool> {
  if (pool) return pool;

  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  pool = new Pool({
    connectionString: config.databaseUrl,
  });

  return pool;
}

export async function initializeDatabase(): Promise<void> {
  if (!config.databaseUrl) {
    console.warn('Database initialization skipped: DATABASE_URL not provided');
    return;
  }

  try {
    const dbPool = await getPool();
    const client = await dbPool.connect();

    try {
      // Enable pgvector
      await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
      
      // Register vector type for this client (for initialization context)
      await pgvector.registerType(client);

      // Create tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS resumes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filename VARCHAR(255) NOT NULL,
          extracted_text TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS job_descriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(500) DEFAULT '',
          description TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      const dimension = config.embeddingDimension;
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS document_chunks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
          job_description_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          chunk_type VARCHAR(50) NOT NULL,
          embedding vector(${dimension}),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS analyses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
          job_description_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
          match_score REAL NOT NULL,
          analysis_json JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_chunks_resume ON document_chunks(resume_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_chunks_jd ON document_chunks(job_description_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_analyses_resume ON analyses(resume_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_analyses_jd ON analyses(job_description_id);`);

      console.log('Database initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function saveResume(filename: string, extractedText: string): Promise<string> {
  const dbPool = await getPool();
  const result = await dbPool.query(
    'INSERT INTO resumes (filename, extracted_text) VALUES ($1, $2) RETURNING id',
    [filename, extractedText]
  );
  return result.rows[0].id;
}

export async function saveJobDescription(title: string, description: string): Promise<string> {
  const dbPool = await getPool();
  const result = await dbPool.query(
    'INSERT INTO job_descriptions (title, description) VALUES ($1, $2) RETURNING id',
    [title, description]
  );
  return result.rows[0].id;
}

export async function saveChunks(chunks: Array<{ resumeId?: string; jobDescriptionId?: string; content: string; chunkType: string; embedding?: number[] }>): Promise<void> {
  if (!chunks.length) return;
  const dbPool = await getPool();
  const client = await dbPool.connect();
  
  try {
    await pgvector.registerType(client);
    await client.query('BEGIN');
    
    for (const chunk of chunks) {
      const embeddingSql = chunk.embedding ? pgvector.toSql(chunk.embedding) : null;
      await client.query(
        'INSERT INTO document_chunks (resume_id, job_description_id, content, chunk_type, embedding) VALUES ($1, $2, $3, $4, $5)',
        [chunk.resumeId || null, chunk.jobDescriptionId || null, chunk.content, chunk.chunkType, embeddingSql]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getChunksByResumeId(resumeId: string): Promise<DocumentChunk[]> {
  const dbPool = await getPool();
  const result = await dbPool.query('SELECT * FROM document_chunks WHERE resume_id = $1', [resumeId]);
  return result.rows.map(row => ({
    id: row.id,
    resumeId: row.resume_id,
    jobDescriptionId: row.job_description_id,
    content: row.content,
    chunkType: row.chunk_type,
    embedding: row.embedding,
    createdAt: row.created_at
  }));
}

export async function getChunksByJobDescriptionId(jobDescriptionId: string): Promise<DocumentChunk[]> {
  const dbPool = await getPool();
  const result = await dbPool.query('SELECT * FROM document_chunks WHERE job_description_id = $1', [jobDescriptionId]);
  return result.rows.map(row => ({
    id: row.id,
    resumeId: row.resume_id,
    jobDescriptionId: row.job_description_id,
    content: row.content,
    chunkType: row.chunk_type,
    embedding: row.embedding,
    createdAt: row.created_at
  }));
}

export async function findSimilarChunks(embedding: number[], resumeId: string, limit: number = 5): Promise<Array<DocumentChunk & { similarity: number }>> {
  const dbPool = await getPool();
  const client = await dbPool.connect();
  
  try {
    await pgvector.registerType(client);
    const embeddingSql = pgvector.toSql(embedding);
    
    const result = await client.query(`
      SELECT *, 1 - (embedding <=> $1::vector) AS similarity 
      FROM document_chunks 
      WHERE resume_id = $2 
      ORDER BY similarity DESC 
      LIMIT $3
    `, [embeddingSql, resumeId, limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      resumeId: row.resume_id,
      jobDescriptionId: row.job_description_id,
      content: row.content,
      chunkType: row.chunk_type,
      embedding: row.embedding,
      createdAt: row.created_at,
      similarity: row.similarity
    }));
  } finally {
    client.release();
  }
}

export async function saveAnalysis(resumeId: string, jobDescriptionId: string, matchScore: number, analysisJson: object): Promise<string> {
  const dbPool = await getPool();
  const result = await dbPool.query(
    'INSERT INTO analyses (resume_id, job_description_id, match_score, analysis_json) VALUES ($1, $2, $3, $4) RETURNING id',
    [resumeId, jobDescriptionId, matchScore, analysisJson]
  );
  return result.rows[0].id;
}

export async function shutdown(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
