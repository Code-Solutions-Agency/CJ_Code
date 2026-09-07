"use client";

import { useState } from "react";
import { appUrl } from "@/lib/utils";
import { Banner, GhostButton } from "./brand";

export function EmbedPanel({ publicKey }: { publicKey: string }) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const base = origin || appUrl();
  const snippet = `<script src="${base}/widget.js" data-public-key="${publicKey}" async></script>`;
  const iframe = `<iframe src="${base}/embed/${publicKey}" title="Book an appointment" style="width:100%;min-height:720px;border:0;border-radius:16px;"></iframe>`;
  const [copied, setCopied] = useState("");

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  return (
    <div className="space-y-6">
      {copied ? <Banner tone="ok">Copied the {copied} snippet.</Banner> : null}
      <div className="surface space-y-3 rounded-3xl p-5">
        <h2 className="font-display text-2xl">Script embed</h2>
        <p className="text-sm text-muted">
          Paste this before the closing <code>&lt;/body&gt;</code> on any page. The script injects an iframe from
          Booklane, so your site&apos;s CSP only needs to allow frames from this origin.
        </p>
        <pre className="overflow-auto rounded-2xl bg-ink px-4 py-3 text-xs text-accent-ink">{snippet}</pre>
        <GhostButton type="button" onClick={() => void copy(snippet, "script")}>
          Copy script
        </GhostButton>
      </div>
      <div className="surface space-y-3 rounded-3xl p-5">
        <h2 className="font-display text-2xl">Iframe embed</h2>
        <p className="text-sm text-muted">
          Use this if you cannot load third-party scripts. Set <code>frame-ancestors</code> is already allowed on the
          embed route.
        </p>
        <pre className="overflow-auto rounded-2xl bg-ink px-4 py-3 text-xs text-accent-ink">{iframe}</pre>
        <GhostButton type="button" onClick={() => void copy(iframe, "iframe")}>
          Copy iframe
        </GhostButton>
      </div>
      <p className="text-sm text-faint">
        Public key <code>{publicKey}</code> is scoped to this workspace only. Other tenants cannot read your bookings
        or services with it.
      </p>
    </div>
  );
}
