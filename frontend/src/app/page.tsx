import Link from "next/link";
import Brand from "@/components/Brand";

const steps = [
  { number: "01", title: "Add your resume", copy: "Upload a PDF to give the review a clear picture of your experience." },
  { number: "02", title: "Choose a role", copy: "Add the job description you are considering." },
  { number: "03", title: "Review the findings", copy: "See relevant experience, gaps, and practical ways to strengthen your application." },
];

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-container site-nav">
        <Link href="/" className="site-brand" aria-label="JobFit home">
          <Brand />
        </Link>
        <nav className="site-nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/analyze" className="site-nav-cta">Review a role <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <main>
        <section className="site-container hero">
          <div>
            <p className="eyebrow">A thoughtful review of your next move</p>
            <h1>Understand how your experience aligns.</h1>
            <p className="hero-copy">
              See where your resume meets a job’s requirements, what is missing, and where to focus before you apply.
            </p>
            <div className="hero-actions">
              <Link href="/analyze" className="button-primary">Review a job match <span aria-hidden="true" style={{ marginLeft: 12 }}>→</span></Link>
              <a href="#how-it-works" className="button-quiet">See how it works <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <aside className="report-preview" aria-label="Illustrative match review">
            <div className="report-meta"><span><i className="report-dot" />MATCH REVIEW</span><span>ILLUSTRATIVE</span></div>
            <div className="report-role">ROLE<strong>Product designer</strong></div>
            <div className="report-score-row">
              <div className="report-score">78<span>%</span></div>
              <div className="report-score-note"><strong>Good alignment</strong>Based on experience shown</div>
            </div>
            <div className="report-progress" aria-hidden="true"><span /></div>
            <div className="report-divider" />
            <div className="report-insight"><span className="report-label">Relevant</span><p>Design systems, prototyping<br /><span>Supported by your experience</span></p></div>
            <div className="report-divider" />
            <div className="report-insight"><span className="report-label">To address</span><p>Accessibility testing<br /><span>Not clearly demonstrated</span></p></div>
            <span className="example-note">Example report</span>
          </aside>
        </section>

        <section className="site-container steps-section" id="how-it-works">
          <div className="section-heading">
            <h2>Clarity before you apply.</h2>
            <p>A straightforward review, from resume to next steps.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-container site-footer">
        <Link href="/" className="site-brand" aria-label="JobFit home"><Brand /></Link>
        <span>Make your next application with more clarity.</span>
      </footer>
    </div>
  );
}