import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Droplets,
  FileWarning,
  Link2,
  Loader2,
  Pill,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload
} from 'lucide-react';
import {
  InputMode,
  PersonalCareSubCategory,
  ProductCategory,
  ProductInput,
  ProductSubCategory,
  SupplementSubCategory,
  ThirdPartyCertStatus
} from '../types/product';

interface ProductInputCardProps {
  product: ProductInput;
  onChange: (updated: ProductInput) => void;
  onClearSlot: () => void;
}

const PERSONAL_CARE_SUBS: {
  id: PersonalCareSubCategory;
  label: string;
  exposureBadge: string;
}[] = [
  { id: 'soap', label: 'Soap / Body Wash', exposureBadge: 'Rinse-Off' },
  { id: 'shampoo', label: 'Shampoo / Scalp', exposureBadge: 'Rinse-Off' },
  { id: 'oil', label: 'Body & Hair Oil', exposureBadge: 'Leave-On (1.25×)' }
];

const SUPPLEMENT_SUBS: {
  id: SupplementSubCategory;
  label: string;
}[] = [
  { id: 'multivitamin', label: 'Daily Multi / Prenatal' },
  { id: 'single_nutrient', label: 'Vitamin / Mineral' },
  { id: 'botanical_herbal', label: 'Herbal / Ayurvedic' },
  { id: 'omega_specialty', label: 'Omega-3 / Specialty' }
];

export const ProductInputCard: React.FC<ProductInputCardProps> = ({
  product,
  onChange,
  onClearSlot
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [customUnreadableNote, setCustomUnreadableNote] = useState('');

  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = <K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) => {
    onChange({
      ...product,
      [key]: value
    });
  };

  const handleCategorySwitch = (newCategory: ProductCategory) => {
    const defaultSub: ProductSubCategory =
      newCategory === 'personal_care' ? 'shampoo' : 'multivitamin';
    const defaultUnit = newCategory === 'personal_care' ? 'fl oz' : 'servings';
    onChange({
      ...product,
      category: newCategory,
      subCategory: defaultSub,
      quantityUnit: defaultUnit
    });
  };

  const handlePhotoUpload = (
    side: 'front' | 'back',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      if (side === 'front') {
        onChange({
          ...product,
          frontPhotoBase64: base64,
          frontPhotoName: file.name
        });
      } else {
        onChange({
          ...product,
          backPhotoBase64: base64,
          backPhotoName: file.name
        });
      }
      setExtractError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractWithGemini = async () => {
    if (
      !product.frontPhotoBase64 &&
      !product.backPhotoBase64 &&
      !product.weblinkOrBarcode.trim()
    ) {
      setExtractError(
        'Upload at least one label photo or enter a product URL / barcode before running extraction.'
      );
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);

    try {
      const response = await fetch('/api/extract-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontPhotoBase64: product.frontPhotoBase64,
          backPhotoBase64: product.backPhotoBase64,
          weblinkOrBarcode: product.weblinkOrBarcode,
          categoryHint: `${product.category} (${product.subCategory})`
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe product label.');
      }

      const detectedCategory: ProductCategory =
        data.detectedCategory === 'supplement' ? 'supplement' : 'personal_care';

      const validSubs: ProductSubCategory[] = [
        'soap',
        'shampoo',
        'oil',
        'multivitamin',
        'single_nutrient',
        'botanical_herbal',
        'omega_specialty'
      ];
      const detectedSubCategory: ProductSubCategory = validSubs.includes(
        data.detectedSubCategory
      )
        ? data.detectedSubCategory
        : detectedCategory === 'supplement'
          ? 'multivitamin'
          : 'shampoo';

      const validCerts: ThirdPartyCertStatus[] = [
        'none',
        'usp',
        'nsf',
        'consumerlab',
        'cgmp_only'
      ];
      const detectedCert: ThirdPartyCertStatus = validCerts.includes(
        data.thirdPartyTesting
      )
        ? data.thirdPartyTesting
        : product.supplementPanel.thirdPartyTesting;

      onChange({
        ...product,
        brand: data.brand || product.brand,
        name: data.productName || product.name,
        category: detectedCategory,
        subCategory: detectedSubCategory,
        price:
          typeof data.price === 'number' && data.price > 0
            ? String(data.price)
            : product.price,
        quantity:
          typeof data.quantity === 'number' && data.quantity > 0
            ? String(data.quantity)
            : product.quantity,
        claimsRaw:
          Array.isArray(data.claims) && data.claims.length > 0
            ? data.claims.join(', ')
            : product.claimsRaw,
        ingredientsRaw:
          Array.isArray(data.ingredients) && data.ingredients.length > 0
            ? data.ingredients.join(', ')
            : product.ingredientsRaw,
        supplementPanel: {
          servingSize:
            data.servingSize || product.supplementPanel.servingSize,
          activeIngredientsRaw:
            Array.isArray(data.activeIngredients) &&
            data.activeIngredients.length > 0
              ? data.activeIngredients.join(', ')
              : product.supplementPanel.activeIngredientsRaw,
          thirdPartyTesting: detectedCert,
          exceedsUpperLimit:
            typeof data.exceedsUpperLimit === 'boolean'
              ? data.exceedsUpperLimit
              : product.supplementPanel.exceedsUpperLimit
        },
        unreadableFlags: Array.isArray(data.unreadableFlags)
          ? data.unreadableFlags
          : product.unreadableFlags
      });

      setExtractSuccess(
        Array.isArray(data.unreadableFlags) && data.unreadableFlags.length > 0
          ? 'Label extracted with unreadable section warnings — please review flagged areas below.'
          : 'Label details extracted! Review ingredients and optional price/quantity below.'
      );
    } catch (err: unknown) {
      setExtractError(
        err instanceof Error
          ? err.message
          : 'Unable to extract label automatically. You can type or edit the fields directly below.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddUnreadableFlag = () => {
    const trimmed = customUnreadableNote.trim();
    if (!trimmed) return;
    updateField('unreadableFlags', [...product.unreadableFlags, trimmed]);
    setCustomUnreadableNote('');
  };

  const handleRemoveUnreadableFlag = (idx: number) => {
    updateField(
      'unreadableFlags',
      product.unreadableFlags.filter((_, i) => i !== idx)
    );
  };

  const showPhotoSection =
    product.inputMode === 'photo' || product.inputMode === 'hybrid';
  const showLinkSection =
    product.inputMode === 'link_barcode' || product.inputMode === 'hybrid';

  const slotRoleLabel =
    product.slot === 'A'
      ? 'Product A (Partner A Pick / Current Staple)'
      : 'Product B (Partner B Pick / New Alternative)';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full shadow-2xs">
      <div className="space-y-5">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-teal-800">
              {slotRoleLabel}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {product.name.trim()
                ? `${product.brand ? `${product.brand} — ` : ''}${product.name}`
                : `Enter Product ${product.slot} Details`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClearSlot}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        {/* Primary Category & Input Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Category
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleCategorySwitch('personal_care')}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  product.category === 'personal_care'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Droplets className="w-3.5 h-3.5 text-teal-700" />
                Personal Care
              </button>
              <button
                type="button"
                onClick={() => handleCategorySwitch('supplement')}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  product.category === 'supplement'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pill className="w-3.5 h-3.5 text-teal-700" />
                Supplements
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Label Intake Method
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'hybrid', label: 'All Inputs' },
                  { id: 'photo', label: 'Photos' },
                  { id: 'link_barcode', label: 'URL / UPC' }
                ] as { id: InputMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateField('inputMode', m.id)}
                  className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    product.inputMode === m.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-Category Selector (Soaps / Shampoos / Oils OR Supplement Types) */}
        <div className="p-3.5 bg-teal-50/50 border border-teal-200/80 rounded-lg space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">
              {product.category === 'personal_care'
                ? 'Personal Care Type & Exposure Route'
                : 'Supplement Type'}
            </span>
            <span className="text-[11px] font-medium text-teal-800">
              {product.category === 'personal_care'
                ? product.subCategory === 'oil'
                  ? 'Leave-On Dermal Absorption (1.25× risk weight)'
                  : 'Rinse-Off Shower/Wash Exposure (1.0× weight)'
                : 'Daily Systemic Oral Ingestion (NIH ODS Audited)'}
            </span>
          </div>

          {product.category === 'personal_care' ? (
            <div className="grid grid-cols-3 gap-2">
              {PERSONAL_CARE_SUBS.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => updateField('subCategory', sub.id)}
                  className={`px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                    product.subCategory === sub.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-600'
                  }`}
                >
                  <div className="text-xs font-semibold">{sub.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      product.subCategory === sub.id
                        ? 'text-teal-100'
                        : 'text-slate-500'
                    }`}
                  >
                    {sub.exposureBadge}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPLEMENT_SUBS.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => updateField('subCategory', sub.id)}
                  className={`px-2.5 py-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                    product.subCategory === sub.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-600'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Photo Upload Dropzones */}
        {showPhotoSection && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-700" />
                Front & Back Label Photos (AI Label Reader)
              </span>
              <span className="text-xs text-slate-500">
                Flags blurry text without guessing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Front Photo */}
              <div className="border border-dashed border-slate-300 bg-white rounded-lg p-3 flex flex-col justify-between">
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload('front', e)}
                />
                {product.frontPhotoBase64 ? (
                  <div className="space-y-2">
                    <img
                      src={product.frontPhotoBase64}
                      alt={`Product ${product.slot} front label`}
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover rounded border border-slate-200"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 truncate">
                        {product.frontPhotoName || 'Front label loaded'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...product,
                            frontPhotoBase64: undefined,
                            frontPhotoName: undefined
                          });
                        }}
                        className="text-xs text-red-600 hover:underline whitespace-nowrap shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    className="w-full py-3.5 flex flex-col items-center justify-center text-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium">
                      Upload Front Label
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Brand & marketing claims
                    </span>
                  </button>
                )}
              </div>

              {/* Back Photo */}
              <div className="border border-dashed border-slate-300 bg-white rounded-lg p-3 flex flex-col justify-between">
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload('back', e)}
                />
                {product.backPhotoBase64 ? (
                  <div className="space-y-2">
                    <img
                      src={product.backPhotoBase64}
                      alt={`Product ${product.slot} back label`}
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover rounded border border-slate-200"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 truncate">
                        {product.backPhotoName || 'Back label loaded'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...product,
                            backPhotoBase64: undefined,
                            backPhotoName: undefined
                          });
                        }}
                        className="text-xs text-red-600 hover:underline whitespace-nowrap shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    className="w-full py-3.5 flex flex-col items-center justify-center text-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium">
                      Upload Back Label
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Ingredients & supplement facts
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weblink / Barcode Input */}
        {showLinkSection && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Product Weblink, Barcode (UPC/EAN), or Store Search Query
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={product.weblinkOrBarcode}
                onChange={(e) =>
                  updateField('weblinkOrBarcode', e.target.value)
                }
                placeholder="Paste product link, UPC barcode, or brand + product name..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>
        )}

        {/* Gemini OCR Extraction Action Button */}
        {(showPhotoSection || showLinkSection) && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isExtracting}
              onClick={handleExtractWithGemini}
              className="w-full py-2 px-4 text-xs font-medium text-teal-900 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Reading Packaging Label via Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  Auto-Fill Ingredients & Claims from Photo or Link
                </>
              )}
            </button>

            {extractError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{extractError}</span>
              </div>
            )}

            {extractSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{extractSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* Brand & Product Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Brand / Maker
            </label>
            <input
              type="text"
              value={product.brand}
              onChange={(e) => updateField('brand', e.target.value)}
              placeholder={
                product.category === 'personal_care'
                  ? 'e.g., PureRoot, Dr. Bronner’s, Sri Sri Tattva'
                  : 'e.g., Kinsfolk Nutrients, Thorne, Nature Made'
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={
                product.category === 'personal_care'
                  ? 'e.g., Cold-Pressed Almond Oil, Gentle Shampoo'
                  : 'e.g., Couples Daily Multi, Magnesium Glycinate'
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
            />
          </div>
        </div>

        {/* Packaging Claims Made */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Front-of-Bottle Claims (Comma-separated)
          </label>
          <input
            type="text"
            value={product.claimsRaw}
            onChange={(e) => updateField('claimsRaw', e.target.value)}
            placeholder={
              product.category === 'personal_care'
                ? 'e.g., Cold-Pressed, Sulfate-Free, Paraben-Free, Natural, Hypoallergenic'
                : 'e.g., USP Verified, Organic, Non-GMO, Clean Label'
            }
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Supplement-Specific Panel (Active Nutrients, 3rd-Party Testing, Upper Limit) */}
        {product.category === 'supplement' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                Supplement Facts: Actives, Bioavailability & 3rd-Party Purity
              </span>
              <input
                type="text"
                value={product.supplementPanel.servingSize}
                onChange={(e) =>
                  updateField('supplementPanel', {
                    ...product.supplementPanel,
                    servingSize: e.target.value
                  })
                }
                placeholder="Serving size (e.g., 2 capsules)"
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded w-44"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Active Nutrients / Botanicals & Dosages (Comma-separated)
              </label>
              <textarea
                rows={2}
                value={product.supplementPanel.activeIngredientsRaw}
                onChange={(e) =>
                  updateField('supplementPanel', {
                    ...product.supplementPanel,
                    activeIngredientsRaw: e.target.value
                  })
                }
                placeholder="e.g., Vitamin D3 (Cholecalciferol) 2000 IU, Magnesium Glycinate 200 mg, Folate (L-5-MTHF) 400 mcg DFE, Zinc Picolinate 15 mg"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Independent 3rd-Party Purity Seal
                </label>
                <select
                  value={product.supplementPanel.thirdPartyTesting}
                  onChange={(e) =>
                    updateField('supplementPanel', {
                      ...product.supplementPanel,
                      thirdPartyTesting: e.target.value as ThirdPartyCertStatus
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                >
                  <option value="none">None Declared on Label</option>
                  <option value="usp">USP Verified Seal (+14 pts)</option>
                  <option value="nsf">NSF International Certified (+12 pts)</option>
                  <option value="consumerlab">ConsumerLab Approved (+10 pts)</option>
                  <option value="cgmp_only">cGMP Manufactured Only (+2 pts)</option>
                </select>
              </div>

              <label className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer mt-3 sm:mt-0">
                <input
                  type="checkbox"
                  checked={product.supplementPanel.exceedsUpperLimit}
                  onChange={(e) =>
                    updateField('supplementPanel', {
                      ...product.supplementPanel,
                      exceedsUpperLimit: e.target.checked
                    })
                  }
                  className="mt-0.5 rounded text-teal-700 focus:ring-teal-600"
                />
                <span className="text-[11px] text-slate-700 leading-snug">
                  <strong>Exceeds NIH Upper Limit (UL):</strong> Check if any dose exceeds safe daily upper intake thresholds (e.g., Vitamin D &gt;4,000 IU, Zinc &gt;40 mg, B6 &gt;100 mg).
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Ordered Ingredients / Excipients List */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700">
              {product.category === 'personal_care'
                ? 'Full Ingredient List in Label Order (INCI, comma-separated) *'
                : 'Full Ingredient & Excipient List (Other Ingredients / Coatings / Fillers) *'}
            </label>
            <span className="text-[11px] text-slate-500">
              Top 5 ingredients carry 1.3× weight
            </span>
          </div>
          <textarea
            rows={4}
            value={product.ingredientsRaw}
            onChange={(e) => updateField('ingredientsRaw', e.target.value)}
            placeholder={
              product.category === 'personal_care'
                ? product.subCategory === 'oil'
                  ? 'e.g., Simmondsia Chinensis (Jojoba) Seed Oil, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Tocopherol...'
                  : 'e.g., Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Fragrance, Propylparaben...'
                : 'e.g., Microcrystalline Cellulose, Hypromellose (Vegetable Capsule), Titanium Dioxide, FD&C Red No. 40, Talc...'
            }
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Price & Quantity Inputs for Quality ROI (Optional) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-800">
              Household Budget & Net Size (Optional — Computes Value ROI)
            </span>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              ROI = Score ÷ Price ÷ Size × 100
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Price ($ USD)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={product.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="e.g. 12.99"
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Size / Servings
              </label>
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={product.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Unit
              </label>
              <select
                value={product.quantityUnit}
                onChange={(e) =>
                  updateField(
                    'quantityUnit',
                    e.target.value as ProductInput['quantityUnit']
                  )
                }
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              >
                <option value="fl oz">fl oz</option>
                <option value="oz">oz</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="servings">servings</option>
                <option value="count">count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Unreadable Label Honesty Disclosure */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
              <FileWarning className="w-3.5 h-3.5 text-amber-700" />
              Missing or Blurry Label Text? (No-Guessing Disclosure)
            </span>
          </div>
          {product.unreadableFlags.length > 0 && (
            <ul className="space-y-1">
              {product.unreadableFlags.map((flag, idx) => (
                <li
                  key={idx}
                  className="text-xs text-amber-900 bg-white border border-amber-200 rounded px-2.5 py-1.5 flex items-center justify-between gap-2"
                >
                  <span>{flag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUnreadableFlag(idx)}
                    className="text-[11px] text-slate-500 hover:text-red-600 whitespace-nowrap shrink-0"
                  >
                    Dismiss
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customUnreadableNote}
              onChange={(e) => setCustomUnreadableNote(e.target.value)}
              placeholder="If part of a bottle photo or online listing was cut off, note it here..."
              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded focus:outline-none focus:border-amber-600"
            />
            <button
              type="button"
              onClick={handleAddUnreadableFlag}
              className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Flag Missing Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
