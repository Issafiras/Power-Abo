/**
 * CampaignManager - Interface til at administrere kampagner
 */

import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/common/Icon';
import { setCampaign, removeCampaign } from '../../utils/adminApi';
import { toast } from '../../utils/toast';

function CampaignManager({ plan, onUpdate }) {
  const [campaignPrice, setCampaignPrice] = useState(plan?.campaignPrice || plan?.campaign_price || '');
  const [endDate, setEndDate] = useState(
    plan?.campaignEndDate || plan?.campaign_end_date
      ? new Date(plan.campaignEndDate || plan.campaign_end_date).toISOString().slice(0, 16)
      : ''
  );
  const [loading, setLoading] = useState(false);

  const hasActiveCampaign = plan?.campaign || (plan?.campaignPrice && plan?.campaignEndDate);

  const handleSetCampaign = async () => {
    if (!campaignPrice || !endDate) {
      toast.error('Udfyld både kampagnepris og slutdato', 3000);
      return;
    }

    setLoading(true);
    try {
      await setCampaign(plan.id, parseInt(campaignPrice), endDate);
      toast.success('Kampagne sat succesfuldt', 3000);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Fejl ved sætning af kampagne:', error);
      toast.error('Fejl ved sætning af kampagne: ' + (error.message || 'Ukendt fejl'), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCampaign = async () => {
    if (!confirm('Er du sikker på at du vil fjerne kampagnen?')) {
      return;
    }

    setLoading(true);
    try {
      await removeCampaign(plan.id);
      toast.success('Kampagne fjernet', 3000);
      setCampaignPrice('');
      setEndDate('');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Fejl ved fjernelse af kampagne:', error);
      toast.error('Fejl ved fjernelse af kampagne: ' + (error.message || 'Ukendt fejl'), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return null;
  }

  const campaignEndDate = plan.campaignEndDate || plan.campaign_end_date;
  const isExpired = campaignEndDate ? new Date(campaignEndDate) < new Date() : false;

  return (
    <Card padding="md" className="admin-campaign-manager">
      <div className="admin-campaign-manager__header">
        <h4 className="admin-campaign-manager__title">
          <Icon name="tag" size={18} className="icon-inline icon-spacing-right" />
          Kampagne Management
        </h4>
      </div>

      {hasActiveCampaign && (
        <div className="admin-campaign-manager__current">
          <div className="admin-campaign-manager__status">
            <Icon 
              name={isExpired ? "alert-circle" : "check-circle"} 
              size={16} 
              className={`icon-inline icon-spacing-right ${isExpired ? 'text-warning' : 'text-success'}`}
            />
            <span className={isExpired ? 'text-warning' : 'text-success'}>
              {isExpired ? 'Kampagne udløbet' : 'Aktiv kampagne'}
            </span>
          </div>
          {campaignEndDate && (
            <div className="admin-campaign-manager__info">
              <p>
                <strong>Kampagnepris:</strong> {plan.campaignPrice || plan.campaign_price} kr
              </p>
              <p>
                <strong>Slutdato:</strong> {new Date(campaignEndDate).toLocaleString('da-DK')}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="admin-campaign-manager__form">
        <div className="admin-campaign-manager__inputs">
          <Input
            label="Kampagnepris (kr)"
            type="number"
            value={campaignPrice}
            onChange={(e) => setCampaignPrice(e.target.value)}
            placeholder="F.eks. 149"
            fullWidth
          />
          <Input
            label="Slutdato"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
          />
        </div>

        <div className="admin-campaign-manager__actions">
          <Button
            variant="primary"
            onClick={handleSetCampaign}
            loading={loading}
            disabled={!campaignPrice || !endDate}
            icon="save"
            size="sm"
          >
            {hasActiveCampaign ? 'Opdater kampagne' : 'Sæt kampagne'}
          </Button>
          {hasActiveCampaign && (
            <Button
              variant="danger"
              onClick={handleRemoveCampaign}
              loading={loading}
              icon="x"
              size="sm"
            >
              Fjern kampagne
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default CampaignManager;
