import type { DashboardViewModel } from "@zeo/contracts";

export function IntegrityBadges({ model }: { model: DashboardViewModel }) {
  return <div className="rounded border p-3"><h3 className="font-semibold">Integrity</h3>
    <ul className="text-sm mt-2 space-y-1">
      <li>Verification: <strong>{model.verificationStatus.verified ? "Verified" : "Unverified"}</strong></li>
      <li>Config hash: <code>{model.fingerprint.configHash.slice(0, 12)}</code></li>
      <li>Policy hash: <code>{model.fingerprint.policyHash?.slice(0, 12) ?? "none"}</code></li>
    </ul></div>;
}
