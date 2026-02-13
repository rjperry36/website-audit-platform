export type InitiativeType =
    | 'CLUB'
    | 'LOCAL'
    | 'BLOG'
    | 'LOYALTY'
    | 'ECOM'
    | 'LIFECYCLE'
    | 'SOCIAL'
    | 'SEO'
    | 'PROMOTION'
    | 'LAUNCH'
    | 'DES_RELEASE'
    | 'ARTICLE'
    // Fallback/Legacy mapping
    | 'lep' | 'promo' | 'lifecycle' | 'club' | 'ecom' | 'blog' | 'local' | 'adoption';

export const INITIATIVE_CONFIG: Record<string, { color: string; label: string }> = {
    // Core Types Requested - Using HEX for Inline Styles
    CLUB: { color: '#2563EB', label: 'CLUB' },        // blue-600
    LOCAL: { color: '#F97316', label: 'LOCAL' },       // orange-500
    BLOG: { color: '#9333EA', label: 'BLOG' },         // purple-600
    LOYALTY: { color: '#4F46E5', label: 'LOYALTY' },   // indigo-600
    ECOM: { color: '#059669', label: 'ECOM' },         // emerald-600
    LIFECYCLE: { color: '#0891B2', label: 'LIFECYCLE' }, // cyan-600
    SOCIAL: { color: '#DB2777', label: 'SOCIAL' },     // pink-600
    SEO: { color: '#0284C7', label: 'SEO' },           // sky-600
    PROMOTION: { color: '#16A34A', label: 'PROMOTION' }, // green-600
    LAUNCH: { color: '#DC2626', label: 'LAUNCH' },     // red-600
    DES_RELEASE: { color: '#0D9488', label: 'DES RELEASE' }, // teal-600
    ARTICLE: { color: '#475569', label: 'ARTICLE' },   // slate-600

    // Legacy Mappings
    club: { color: '#2563EB', label: 'CLUB' },
    local: { color: '#F97316', label: 'LOCAL' },
    blog: { color: '#9333EA', label: 'BLOG' },
    ecom: { color: '#059669', label: 'ECOM' },
    lifecycle: { color: '#0891B2', label: 'LIFECYCLE' },
    promo: { color: '#16A34A', label: 'PROMOTION' },
    lep: { color: '#0D9488', label: 'LEP' },
    adoption: { color: '#65A30D', label: 'ADOPTION' },
};

export const getInitiativeStyle = (type: string) => {
    // Normalize type to handle case sensitivity if needed, though exact match is best
    const config = INITIATIVE_CONFIG[type] || INITIATIVE_CONFIG[type.toUpperCase()] || { color: '#4B5563', label: type.toUpperCase() };
    return config;
};
