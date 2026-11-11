// Auth-page side panel: headline and short lead over the streamer background.

export default function CommunityChat({ headingId, title, highlight, lead }: { headingId: string; title: string; highlight: string; lead: string }) {
  return (
    <div className="chat-panel">
      <div className="chat-intro">
        <p className="eyebrow"><span className="dot" /> COMPARTE TU MÚSICA. DESCUBRE LA DE OTROS.</p>
        <h1 id={headingId}>{title}<br /><em>{highlight}</em></h1>
        <p>{lead}</p>
      </div>
    </div>
  );
}
