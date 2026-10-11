export function SecQuadrant() {
  return (
    <div
      className="card"
      style={{ padding: 24, margin: "20px 0", overflow: "hidden" }}
    >
      <svg
        viewBox="0 0 900 460"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SECI quadrant diagram"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* quadrant backgrounds */}
        <rect x="40" y="40" width="400" height="190" rx="12" fill="#FAF9F5" stroke="#D1CFC5" strokeWidth="1.5" />
        <rect x="460" y="40" width="400" height="190" rx="12" fill="#FAF9F5" stroke="#D1CFC5" strokeWidth="1.5" />
        <rect x="40" y="250" width="400" height="190" rx="12" fill="#FAF9F5" stroke="#D1CFC5" strokeWidth="1.5" />
        <rect x="460" y="250" width="400" height="190" rx="12" fill="#FAF9F5" stroke="#D1CFC5" strokeWidth="1.5" />

        {/* axis labels */}
        <text x="240" y="26" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle" letterSpacing="2">TACIT</text>
        <text x="660" y="26" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle" letterSpacing="2">EXPLICIT</text>
        <text x="18" y="130" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" transform="rotate(-90 18 130)" textAnchor="middle" letterSpacing="2">TACIT</text>
        <text x="18" y="350" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" transform="rotate(-90 18 350)" textAnchor="middle" letterSpacing="2">EXPLICIT</text>

        {/* Socialization */}
        <text x="240" y="100" fontFamily="Georgia,serif" fontSize="26" fill="#141413" textAnchor="middle" fontWeight="500">SOCIALIZATION</text>
        <text x="240" y="128" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle">tacit → tacit</text>
        <text x="240" y="158" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">Apprenticeship · observation ·</text>
        <text x="240" y="180" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">shared experience</text>
        <text x="240" y="212" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fill="#788C5D" textAnchor="middle">AI: meeting copilots, RLHF</text>

        {/* Externalization */}
        <text x="660" y="100" fontFamily="Georgia,serif" fontSize="26" fill="#D97757" textAnchor="middle" fontWeight="500">EXTERNALIZATION</text>
        <text x="660" y="128" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle">tacit → explicit</text>
        <text x="660" y="158" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">Metaphor · dialogue · models</text>
        <text x="660" y="180" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">&ldquo;twist and stretch&rdquo;</text>
        <text x="660" y="212" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fill="#D97757" textAnchor="middle">AI: expert-interview LLMs</text>

        {/* Combination */}
        <text x="660" y="310" fontFamily="Georgia,serif" fontSize="26" fill="#141413" textAnchor="middle" fontWeight="500">COMBINATION</text>
        <text x="660" y="338" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle">explicit → explicit</text>
        <text x="660" y="368" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">Synthesizing documents,</text>
        <text x="660" y="390" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">databases, specs</text>
        <text x="660" y="422" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fill="#788C5D" textAnchor="middle">AI: RAG, Glean, KGs — MATURE</text>

        {/* Internalization */}
        <text x="240" y="310" fontFamily="Georgia,serif" fontSize="26" fill="#141413" textAnchor="middle" fontWeight="500">INTERNALIZATION</text>
        <text x="240" y="338" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle">explicit → tacit</text>
        <text x="240" y="368" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">Learning by doing ·</text>
        <text x="240" y="390" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">embodied mastery</text>
        <text x="240" y="422" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fill="#D97757" textAnchor="middle">AI: Khanmigo, adaptive tutors</text>

        {/* spiral arrows: S → E → C → I → S, clockwise */}
        <path d="M 436 135 L 464 135" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />
        <path d="M 660 226 L 660 254" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />
        <path d="M 464 345 L 436 345" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />
        <path d="M 240 254 L 240 226" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />

        <defs>
          <marker id="spiralArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#D97757" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
