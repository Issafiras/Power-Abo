/**
 * PlanEditForm - Formular til at redigere alle plan felter
 */

import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Icon from '../../components/common/Icon';

function PlanEditForm({ plan, onSave, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    // Basis info
    id: '',
    provider: '',
    name: '',
    data: '',
    price: 0,
    earnings: 0,
    earningsAdditional: null,

    // Kampagne
    campaignPrice: null,
    campaignEndDate: null,
    campaign: false,

    // Features
    features: [],
    featuresText: '',

    // Flags
    isActive: true,
    familyDiscount: false,
    business: false,
    priceVatExcluded: false,
    mostPopular: false,

    // Streaming
    streaming: [],
    streamingText: '',
    streamingCount: null,

    // CBB Mix
    cbbMixAvailable: false,
    cbbMixPricing: null,
    cbbMixPricingText: '',

    // Dates
    expiresAt: null,
    introPrice: null,
    introMonths: null,
    originalPrice: null,

    // Sorting
    sortingOrder: 0,

    // Other
    color: '',
    logo: '',
    type: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-fyld formular når plan ændres
  useEffect(() => {
    if (plan) {
      const featuresArray = Array.isArray(plan.features) ? plan.features : [];
      const streamingArray = Array.isArray(plan.streaming) ? plan.streaming : [];
      const cbbMixPricing = plan.cbbMixPricing || {};

      setFormData({
        id: plan.id || '',
        provider: plan.provider || '',
        name: plan.name || '',
        data: plan.data || '',
        price: plan.price || 0,
        earnings: plan.earnings || 0,
        earningsAdditional: plan.earningsAdditional || null,
        campaignPrice: plan.campaignPrice || plan.campaign_price || null,
        campaignEndDate: plan.campaignEndDate || plan.campaign_end_date || null,
        campaign: plan.campaign || false,
        features: featuresArray,
        featuresText: featuresArray.join(', '),
        isActive: plan.isActive !== undefined ? plan.isActive : (plan.is_active !== undefined ? plan.is_active : true),
        familyDiscount: plan.familyDiscount || plan.family_discount || false,
        business: plan.business || false,
        priceVatExcluded: plan.priceVatExcluded || plan.price_vat_excluded || false,
        mostPopular: plan.mostPopular || plan.most_popular || false,
        streaming: streamingArray,
        streamingText: streamingArray.join(', '),
        streamingCount: plan.streamingCount || plan.streaming_count || null,
        cbbMixAvailable: plan.cbbMixAvailable || plan.cbb_mix_available || false,
        cbbMixPricing: cbbMixPricing,
        cbbMixPricingText: Object.keys(cbbMixPricing).length > 0
          ? JSON.stringify(cbbMixPricing, null, 2)
          : '',
        expiresAt: plan.expiresAt || plan.expires_at || null,
        introPrice: plan.introPrice || plan.intro_price || null,
        introMonths: plan.introMonths || plan.intro_months || null,
        originalPrice: plan.originalPrice || plan.original_price || null,
        sortingOrder: plan.sortingOrder || plan.sorting_order || 0,
        color: plan.color || '',
        logo: plan.logo || '',
        type: plan.type || ''
      });
      setErrors({});
    }
  }, [plan]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Fjern fejl for dette felt
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFeaturesChange = (text) => {
    const features = text.split(',').map(f => f.trim()).filter(f => f.length > 0);
    handleChange('featuresText', text);
    handleChange('features', features);
  };

  const handleStreamingChange = (text) => {
    const streaming = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleChange('streamingText', text);
    handleChange('streaming', streaming);
  };

  const handleCbbMixPricingChange = (text) => {
    try {
      if (text.trim() === '') {
        handleChange('cbbMixPricing', null);
        handleChange('cbbMixPricingText', '');
        return;
      }
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        handleChange('cbbMixPricing', parsed);
        handleChange('cbbMixPricingText', text);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.cbbMixPricing;
          return newErrors;
        });
      } else {
        throw new Error('Skal være et objekt');
      }
    } catch (e) {
      setErrors(prev => ({ ...prev, cbbMixPricing: 'Ugyldig JSON format' }));
      handleChange('cbbMixPricingText', text);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.id.trim()) newErrors.id = 'ID er påkrævet';
    if (!formData.provider.trim()) newErrors.provider = 'Provider er påkrævet';
    if (!formData.name.trim()) newErrors.name = 'Navn er påkrævet';
    if (!formData.data.trim()) newErrors.data = 'Data er påkrævet';
    if (formData.price < 0) newErrors.price = 'Pris skal være positiv';
    if (formData.earnings < 0) newErrors.earnings = 'Earnings skal være positiv';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Konverter form data til plan format
    const planData = {
      ...formData,
      // Konverter tomme strings til null for nullable felter
      earningsAdditional: formData.earningsAdditional || null,
      campaignPrice: formData.campaignPrice || null,
      campaignEndDate: formData.campaignEndDate || null,
      streamingCount: formData.streamingCount || null,
      expiresAt: formData.expiresAt || null,
      introPrice: formData.introPrice || null,
      introMonths: formData.introMonths || null,
      originalPrice: formData.originalPrice || null,
      cbbMixPricing: formData.cbbMixPricing || null
    };

    onSave(planData);
  };

  if (!plan) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="admin-plan-form">
      <Card padding="lg" className="admin-plan-form__card">
        <div className="admin-plan-form__header">
          <h3 className="admin-plan-form__title">
            <Icon name="edit" size={20} className="icon-inline icon-spacing-right" />
            Rediger Plan: {plan.name}
          </h3>
        </div>

        <div className="admin-plan-form__sections">
          {/* Basis Info */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Basis Information</h4>
            <div className="admin-plan-form__grid">
              <Input
                label="ID"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                error={errors.id}
                required
                disabled
                fullWidth
              />
              <Input
                label="Provider"
                value={formData.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                error={errors.provider}
                required
                fullWidth
              />
              <Input
                label="Navn"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
                fullWidth
              />
              <Input
                label="Data"
                value={formData.data}
                onChange={(e) => handleChange('data', e.target.value)}
                error={errors.data}
                required
                fullWidth
              />
            </div>
          </section>

          {/* Priser */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Priser</h4>
            <div className="admin-plan-form__grid">
              <Input
                label="Pris (kr)"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                error={errors.price}
                required
                fullWidth
              />
              <Input
                label="Earnings (kr)"
                type="number"
                value={formData.earnings}
                onChange={(e) => handleChange('earnings', parseInt(e.target.value) || 0)}
                error={errors.earnings}
                fullWidth
              />
              <Input
                label="Earnings Additional (kr)"
                type="number"
                value={formData.earningsAdditional || ''}
                onChange={(e) => handleChange('earningsAdditional', e.target.value ? parseInt(e.target.value) : null)}
                helperText="Efterfølgende abonnementer"
                fullWidth
              />
            </div>
          </section>

          {/* Kampagne */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Kampagne</h4>
            <div className="admin-plan-form__grid">
              <Input
                label="Kampagnepris (kr)"
                type="number"
                value={formData.campaignPrice || ''}
                onChange={(e) => handleChange('campaignPrice', e.target.value ? parseInt(e.target.value) : null)}
                fullWidth
              />
              <Input
                label="Kampagne slutdato"
                type="datetime-local"
                value={formData.campaignEndDate ? new Date(formData.campaignEndDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('campaignEndDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                fullWidth
              />
              <div className="admin-plan-form__checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.campaign}
                    onChange={(e) => handleChange('campaign', e.target.checked)}
                  />
                  <span>Aktiv kampagne</span>
                </label>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Features</h4>
            <Input
              label="Features (kommasepareret)"
              value={formData.featuresText}
              onChange={(e) => handleFeaturesChange(e.target.value)}
              helperText="Separer med komma"
              fullWidth
            />
          </section>

          {/* Flags */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Indstillinger</h4>
            <div className="admin-plan-form__checkboxes">
              <label className="admin-plan-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                <span>Aktiv</span>
              </label>
              <label className="admin-plan-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.familyDiscount}
                  onChange={(e) => handleChange('familyDiscount', e.target.checked)}
                />
                <span>Familierabat</span>
              </label>
              <label className="admin-plan-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.business}
                  onChange={(e) => handleChange('business', e.target.checked)}
                />
                <span>Business</span>
              </label>
              <label className="admin-plan-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.priceVatExcluded}
                  onChange={(e) => handleChange('priceVatExcluded', e.target.checked)}
                />
                <span>Pris ekskl. moms</span>
              </label>
              <label className="admin-plan-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.mostPopular}
                  onChange={(e) => handleChange('mostPopular', e.target.checked)}
                />
                <span>Mest populær</span>
              </label>
            </div>
          </section>

          {/* Streaming */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Streaming</h4>
            <div className="admin-plan-form__grid">
              <Input
                label="Streaming (kommasepareret)"
                value={formData.streamingText}
                onChange={(e) => handleStreamingChange(e.target.value)}
                helperText="Separer med komma"
                fullWidth
              />
              <Input
                label="Streaming Count"
                type="number"
                value={formData.streamingCount || ''}
                onChange={(e) => handleChange('streamingCount', e.target.value ? parseInt(e.target.value) : null)}
                fullWidth
              />
            </div>
          </section>

          {/* CBB Mix */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">CBB Mix</h4>
            <div className="admin-plan-form__grid">
              <label className="admin-plan-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.cbbMixAvailable}
                  onChange={(e) => handleChange('cbbMixAvailable', e.target.checked)}
                />
                <span>CBB Mix tilgængelig</span>
              </label>
              <Input
                label="CBB Mix Pricing (JSON)"
                value={formData.cbbMixPricingText}
                onChange={(e) => handleCbbMixPricingChange(e.target.value)}
                error={errors.cbbMixPricing}
                helperText='JSON format: {"2": 160, "3": 210, ...}'
                fullWidth
              />
            </div>
          </section>

          {/* Dates */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Datoer</h4>
            <div className="admin-plan-form__grid">
              <Input
                label="Udløbsdato"
                type="date"
                value={formData.expiresAt || ''}
                onChange={(e) => handleChange('expiresAt', e.target.value || null)}
                fullWidth
              />
              <Input
                label="Intro pris (kr)"
                type="number"
                value={formData.introPrice || ''}
                onChange={(e) => handleChange('introPrice', e.target.value ? parseInt(e.target.value) : null)}
                fullWidth
              />
              <Input
                label="Intro måneder"
                type="number"
                value={formData.introMonths || ''}
                onChange={(e) => handleChange('introMonths', e.target.value ? parseInt(e.target.value) : null)}
                fullWidth
              />
              <Input
                label="Original pris (kr)"
                type="number"
                value={formData.originalPrice || ''}
                onChange={(e) => handleChange('originalPrice', e.target.value ? parseInt(e.target.value) : null)}
                fullWidth
              />
            </div>
          </section>

          {/* Other */}
          <section className="admin-plan-form__section">
            <h4 className="admin-plan-form__section-title">Andet</h4>
            <div className="admin-plan-form__grid">
              <Input
                label="Sorting Order"
                type="number"
                value={formData.sortingOrder}
                onChange={(e) => handleChange('sortingOrder', parseInt(e.target.value) || 0)}
                fullWidth
              />
              <Input
                label="Farve"
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                fullWidth
              />
              <Input
                label="Logo URL"
                type="url"
                value={formData.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                fullWidth
              />
              <Input
                label="Type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                helperText="f.eks. 'broadband'"
                fullWidth
              />
            </div>
          </section>
        </div>

        <div className="admin-plan-form__actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annullér
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon="save"
          >
            Gem ændringer
          </Button>
        </div>
      </Card>
    </form>
  );
}

export default PlanEditForm;
