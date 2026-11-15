import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  ALLOWED_BODIES,
  FLAGGED_ADDITIVES_DB,
  OFFICIAL_REGISTRIES,
  SOURCE_CONFLICT_RULES
} from '../data/regulatoryData';
import { AllowedAuthorityId, GlossaryTerm } from '../types/product';

interface ClaimsGlossaryViewProps {
  glossary: GlossaryTerm[];
  onAddTerm: (newTerm: GlossaryTerm) => void;
}

export const ClaimsGlossaryView: React.FC<ClaimsGlossaryViewProps> = ({
  glossary,
  onAddTerm
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [termName, setTermName] = useState('');
  const [aliasesInput, setAliasesInput] = useState('');
  const [termCategory] =
    useState<GlossaryTerm['category']>('core_label');
  const [legalDef, setLegalDef] = useState('');
  const [certifyingBody, setCertifyingBody] = useState('');
  const [authorityCited, setAuthorityCited] =
    useState<AllowedAuthorityId>('FDA');
  const [citationUrl, setCitationUrl] = useState('https://www.fda.gov/');
  const [redFlagsInput, setRedFlagsInput] = useState('');
  const [verificationRule, setVerificationRule] =
    useState<GlossaryTerm['verificationRule']>(
      'Verified if Certified'
    );

  const filteredGlossary = glossary.filter((item) => {
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.term.toLowerCase().includes(q) ||
      item.legalDefinition.toLowerCase().includes(q) ||
      item.aliases.some((a) => a.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termName.trim() || !legalDef.trim()) return;

    const created: GlossaryTerm = {
      id: `custom-term-${Date.now()}`,
      term: termName.trim(),
      aliases: aliasesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      category: termCategory,
      legalDefinition: legalDef.trim(),
      certifyingBody: certifyingBody.trim() || 'None specified',
      authorityCited,
      citationUrl: citationUrl.trim() || 'https://www.fda.gov/',
      redFlags: redFlagsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      verificationRule:
        verificationRule === 'Verified if Certified' ||
        verificationRule === 'Regulated Threshold' ||
        verificationRule === 'Unregulated / Marketing Term'
          ? verificationRule
          : 'Unregulated / Marketing Term'
    };

    onAddTerm(created);
    setTermName('');
    setAliasesInput('');
    setLegalDef('');
    setCertifyingBody('');
    setRedFlagsInput('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-medium text-teal-800">
            Packaging Claim Verification Guide
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
            Personal Care & Supplement Claims Glossary
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Statutory definitions, accrediting bodies (USP, NSF, USDA Organic),
            and greenwashing red flags used to audit soap, shampoo, body/hair
            oil, and supplement labels.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Custom Claim Term
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims (e.g., USP Verified, Cold-Pressed, Organic, Hypoallergenic)..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Terms' },
            { id: 'core_label', label: 'Core Certifications' },
            { id: 'personal_care', label: 'Soaps, Shampoos & Oils' },
            { id: 'questioned_claim', label: 'Botanical & Herbal' },
            { id: 'environment_body', label: 'Eco & Microplastics' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Glossary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {filteredGlossary.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <div className="text-xs text-slate-500">
                    Authority: {item.authorityCited} · {item.verificationRule}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                    {item.term}
                  </h3>
                </div>
                <a
                  href={item.citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-teal-700 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  {item.authorityCited} Standard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-800">
                  Official Regulatory Definition
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  {item.legalDefinition}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-800">
                  Certifying Body
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {item.certifyingBody}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-red-800">
                  Red Flags & Misleading Usage Patterns
                </div>
                <ul className="mt-1 space-y-1">
                  {item.redFlags.map((rf, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                      <span className="text-red-600 select-none">•</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Matched Label Keywords: {item.aliases.join(' · ')}
            </div>
          </div>
        ))}
      </div>

      {/* Add-a-Term Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Add Custom Packaging Claim Rule
                </h3>
                <p className="text-xs text-slate-500">
                  New terms are immediately active when comparing products.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Claim Term Title *
                </label>
                <input
                  type="text"
                  required
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  placeholder="e.g., Hexane-Free / Expeller-Pressed"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Allowed Authority *
                  </label>
                  <select
                    value={authorityCited}
                    onChange={(e) =>
                      setAuthorityCited(e.target.value as AllowedAuthorityId)
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {ALLOWED_BODIES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Verification Rule *
                  </label>
                  <select
                    value={verificationRule}
                    onChange={(e) =>
                      setVerificationRule(
                        e.target.value as GlossaryTerm['verificationRule']
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Verified if Certified">
                      Verified if Certified
                    </option>
                    <option value="Regulated Threshold">
                      Regulated Threshold
                    </option>
                    <option value="Unregulated / Marketing Term">
                      Unregulated / Marketing Term
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Trigger Keywords / Aliases (Comma-separated)
                </label>
                <input
                  type="text"
                  value={aliasesInput}
                  onChange={(e) => setAliasesInput(e.target.value)}
                  placeholder="hexane free, expeller pressed, unrefined"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Official Regulatory Definition *
                </label>
                <textarea
                  rows={2}
                  required
                  value={legalDef}
                  onChange={(e) => setLegalDef(e.target.value)}
                  placeholder="Cite the statutory or regulatory standard..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Certifying Body
                  </label>
                  <input
                    type="text"
                    value={certifyingBody}
                    onChange={(e) => setCertifyingBody(e.target.value)}
                    placeholder="e.g., Codex / USDA AMS"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Official Citation URL
                  </label>
                  <input
                    type="url"
                    value={citationUrl}
                    onChange={(e) => setCitationUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Red Flags (One per line)
                </label>
                <textarea
                  rows={2}
                  value={redFlagsInput}
                  onChange={(e) => setRedFlagsInput(e.target.value)}
                  placeholder="Describe how brands misuse this claim..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
                >
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdditivesRegistryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPlastic, setOnlyPlastic] = useState(false);

  const filtered = FLAGGED_ADDITIVES_DB.filter((item) => {
    if (onlyPlastic && !item.isPlasticRelated && item.category !== 'plastic_endocrine') {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.sideEffectsSummary.toLowerCase().includes(q) ||
      item.synonyms.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="text-xs font-medium text-teal-800">
          Household Toxicology Reference
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
          Flagged Personal Care & Supplement Ingredients of Concern
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Curated regulatory toxicology database covering endocrine disruptors
          (phthalates, parabens, BPA, BHA/BHT), harsh soap/shampoo surfactants,
          leave-on petroleum oil bases, and supplement tablet excipients
          (Titanium Dioxide, Talc, synthetic dyes).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phthalate, paraben, SLS, titanium dioxide, mineral oil, BHT..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setOnlyPlastic(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !onlyPlastic
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Flagged Ingredients ({FLAGGED_ADDITIVES_DB.length})
          </button>
          <button
            type="button"
            onClick={() => setOnlyPlastic(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              onlyPlastic
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Endocrine & Plastic Concerns Only
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-200">
          {filtered.map((item) => (
            <div key={item.id} className="p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-base font-semibold text-slate-900">
                    {item.name}
                  </span>
                  {(item.isPlasticRelated ||
                    item.category === 'plastic_endocrine') && (
                    <span className="ml-2 text-xs font-medium text-red-700">
                      · Hormone / Plasticizer Concern
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {item.riskTier === 'High' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      High Risk Tier
                    </span>
                  ) : item.riskTier === 'Moderate' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Moderate Risk Tier
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Low Risk Tier
                    </span>
                  )}
                  <a
                    href={item.citationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline whitespace-nowrap shrink-0"
                  >
                    {item.primaryAuthority} Source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Primary Authority: {item.primaryAuthority} · Registry:{' '}
                {item.registryName} · Household Focus:{' '}
                {item.vulnerableGroups.join(', ')}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">
                  Regulatory Status & Limits:
                </strong>{' '}
                {item.regulatoryStatusAndLimit}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900">
                  Biological & Health Risks:
                </strong>{' '}
                {item.sideEffectsSummary}
              </p>

              {item.coupleHealthImpact && (
                <p className="text-xs text-teal-950 bg-teal-50/70 border border-teal-200 rounded px-3 py-1.5">
                  <strong>Why It Matters for Married Couples:</strong>{' '}
                  {item.coupleHealthImpact}
                </p>
              )}

              {item.conflictNote && (
                <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
                  <strong>Inter-Agency Comparison Note:</strong>{' '}
                  {item.conflictNote}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SourceRulesView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <div className="text-xs font-medium text-teal-800">
          Evidence & Regulatory Governance
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
          Approved Regulatory Authorities & Registry Lookup Protocol
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Every wellbeing score and health risk explanation is anchored to these
          9 official public health and toxicology bodies, ranked by precautionary
          conflict precedence.
        </p>
      </div>

      {/* Conflict & Citation Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOURCE_CONFLICT_RULES.map((rule, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              {rule.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {rule.description}
            </p>
          </div>
        ))}
      </div>

      {/* Allowed Bodies Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          01. Official Regulatory Bodies Ranked by Precautionary Precedence
        </h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-700">
                    Rank
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-700">
                    Authority
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-700">
                    Jurisdiction
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-700">
                    Personal Care & Supplement Scope
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-700 text-right">
                    Portal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ALLOWED_BODIES.map((body) => (
                  <tr key={body.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-500">
                      #{body.conflictRank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {body.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {body.fullName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {body.jurisdiction}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-md">
                      {body.scope}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={body.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline whitespace-nowrap shrink-0"
                      >
                        Official Site
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Registry Reading Guide */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          02. Official Registries Reading Guide
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {OFFICIAL_REGISTRIES.map((reg) => (
            <div
              key={reg.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-xs text-slate-500">
                      Authority: {reg.authority}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 mt-0.5">
                      {reg.name}
                    </h4>
                  </div>
                  <a
                    href={reg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-teal-700 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    Open Registry
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {reg.whatItCovers}
                </p>

                <div>
                  <div className="text-xs font-semibold text-slate-800 mb-1">
                    How We Audit Labels Against This Registry:
                  </div>
                  <ol className="space-y-1 list-decimal list-inside text-xs text-slate-600">
                    {reg.howToRead.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">
                  Verified Audit Fields:{' '}
                  <span className="font-mono text-slate-700">
                    {reg.checkRecordFields.join(' · ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
