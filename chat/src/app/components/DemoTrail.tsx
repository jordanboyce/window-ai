import { Link } from 'react-router-dom';

const steps = [
  {
    to: '/status',
    title: '1 · Check your browser',
    detail: 'See which APIs are ready and which need a model download or a flag.',
    meaning: 'A missing API is a browser setup result, not a simulated AI answer.',
  },
  {
    to: '/translate/translate-demo',
    title: '2 · Translate',
    detail: 'Use the prefilled English sentence and translate it into Spanish. The language pack may download on first use.',
    meaning: 'The browser provides the translation model; this page only sends the input to its API.',
  },
  {
    to: '/webmcp/webmcp-demo',
    title: '3 · Recipe Workbench',
    detail: 'Browse recipes without AI. With WebMCP enabled, inspect the registered actions; with the Prompt API ready, try the in-page assistant.',
    meaning: 'The page exposes actions as tools to compatible external agents. The in-page assistant uses the same handlers directly. Recipe browsing alone does not demonstrate WebMCP.',
  },
];

/** A short, shareable classroom path that still has something to show without Nano. */
export function DemoTrail() {
  return (
    <section aria-labelledby="demo-trail-title" style={{ marginBottom: '1.5em' }}>
      <h2 id="demo-trail-title" className="font-display" style={{ color: 'var(--fg)', fontSize: '1.4em', fontWeight: 700, margin: '0 0 .3em' }}>
        Three-minute demo path
      </h2>
      <p style={{ color: 'var(--fg3)', margin: '0 0 1em' }}>
        Start here with a class or a colleague. Recipe browsing works without the model;
        AI features require a supported browser and their downloads or flags.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.8em' }}>
        {steps.map((step) => (
          <Link key={step.to} to={step.to} style={{ display: 'block', padding: '1em', border: '1px solid var(--border)', borderRadius: '.8em', background: 'var(--surface)', textDecoration: 'none' }}>
            <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '.35em' }}>{step.title}</strong>
            <span style={{ color: 'var(--fg3)', fontSize: '.86em', lineHeight: 1.5 }}>{step.detail}</span>
            <span style={{ display: 'block', color: 'var(--fg2)', fontSize: '.82em', lineHeight: 1.5, marginTop: '.7em' }}><strong>What it shows:</strong> {step.meaning}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
