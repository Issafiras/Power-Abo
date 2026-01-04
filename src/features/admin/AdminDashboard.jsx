/**
 * AdminDashboard - Hovedkomponent for admin interface
 */

import React, { useState, useMemo } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAdminPlans } from '../../hooks/useAdminPlans';
import PlanEditForm from './PlanEditForm';
import CampaignManager from './CampaignManager';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Icon from '../../components/common/Icon';
import { updatePlan, togglePlanStatus } from '../../utils/adminApi';
import { toast } from '../../utils/toast';

function AdminDashboard({ onClose }) {
  const { isAuthenticated, login, logout, isLoading: authLoading } = useAdminAuth();
  const { plans, loading: plansLoading, error, refetch } = useAdminPlans();
  
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filtrer planer
  const filteredPlans = useMemo(() => {
    let filtered = plans;

    // Filtrer på provider
    if (selectedProvider !== 'all') {
      filtered = filtered.filter(p => p.provider === selectedProvider);
    }

    // Filtrer på søgning
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.id?.toLowerCase().includes(query) ||
        p.provider?.toLowerCase().includes(query) ||
        p.data?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [plans, selectedProvider, searchQuery]);

  // Hent unikke providers
  const providers = useMemo(() => {
    const uniqueProviders = [...new Set(plans.map(p => p.provider))];
    return uniqueProviders.sort();
  }, [plans]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!password) {
      setLoginError('Indtast password');
      return;
    }

    if (login(password)) {
      setPassword('');
    } else {
      setLoginError('Forkert password');
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setShowEditForm(true);
  };

  const handleSavePlan = async (planData) => {
    setSaving(true);
    try {
      await updatePlan(planData.id, planData);
      toast.success('Plan opdateret succesfuldt', 3000);
      setShowEditForm(false);
      setSelectedPlan(null);
      await refetch();
    } catch (error) {
      console.error('Fejl ved opdatering af plan:', error);
      toast.error('Fejl ved opdatering: ' + (error.message || 'Ukendt fejl'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setSelectedPlan(null);
  };

  const handleToggleStatus = async (plan) => {
    try {
      await togglePlanStatus(plan.id, !plan.isActive);
      toast.success(`Plan ${plan.isActive ? 'deaktiveret' : 'aktiveret'}`, 3000);
      await refetch();
    } catch (error) {
      console.error('Fejl ved toggle af status:', error);
      toast.error('Fejl ved opdatering: ' + (error.message || 'Ukendt fejl'), 5000);
    }
  };

  // Login formular
  if (!isAuthenticated) {
    return (
      <div className="admin-dashboard admin-dashboard--login">
        <Card padding="xl" className="admin-dashboard__login-card">
          <div className="admin-dashboard__login-header">
            <Icon name="lock" size={32} className="admin-dashboard__login-icon" />
            <h2 className="admin-dashboard__login-title">Admin Login</h2>
            <p className="admin-dashboard__login-subtitle">
              Indtast password for at få adgang til admin dashboard
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="admin-dashboard__login-form">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={loginError}
              required
              fullWidth
              autoFocus
              icon="lock"
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={authLoading}
            >
              Log ind
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Hoveddashboard
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div className="admin-dashboard__header-content">
          <h2 className="admin-dashboard__title">
            <Icon name="settings" size={24} className="icon-inline icon-spacing-right" />
            Admin Dashboard
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            icon="log-out"
          >
            Log ud
          </Button>
        </div>
      </div>

      {showEditForm && selectedPlan ? (
        <div className="admin-dashboard__edit-view">
          <div className="admin-dashboard__edit-header">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              icon="arrow-left"
            >
              Tilbage til liste
            </Button>
          </div>
          <PlanEditForm
            plan={selectedPlan}
            onSave={handleSavePlan}
            onCancel={handleCancelEdit}
            loading={saving}
          />
        </div>
      ) : (
        <div className="admin-dashboard__main">
          {/* Filters */}
          <Card padding="md" className="admin-dashboard__filters">
            <div className="admin-dashboard__filters-grid">
              <Input
                label="Søg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søg efter plan..."
                icon="search"
                fullWidth
              />
              <div className="admin-dashboard__provider-filter">
                <label className="admin-dashboard__filter-label">Provider:</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="admin-dashboard__select"
                >
                  <option value="all">Alle</option>
                  {providers.map(provider => (
                    <option key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                icon="refresh-cw"
                disabled={plansLoading}
              >
                Opdater
              </Button>
            </div>
          </Card>

          {/* Plan liste */}
          {plansLoading ? (
            <div className="admin-dashboard__loading">
              <Icon name="loader" size={32} className="icon-spinning" />
              <p>Indlæser planer...</p>
            </div>
          ) : error ? (
            <Card padding="md" className="admin-dashboard__error">
              <Icon name="alert-circle" size={24} className="text-error" />
              <p className="text-error">Fejl: {error}</p>
            </Card>
          ) : filteredPlans.length === 0 ? (
            <Card padding="md" className="admin-dashboard__empty">
              <Icon name="inbox" size={32} className="opacity-30" />
              <p>Ingen planer fundet</p>
            </Card>
          ) : (
            <div className="admin-dashboard__plans">
              {filteredPlans.map(plan => (
                <Card
                  key={plan.id}
                  padding="md"
                  hoverable
                  className={`admin-dashboard__plan-card ${!plan.isActive ? 'admin-dashboard__plan-card--inactive' : ''}`}
                >
                  <div className="admin-dashboard__plan-header">
                    <div className="admin-dashboard__plan-info">
                      <h3 className="admin-dashboard__plan-name">
                        {plan.name}
                        {!plan.isActive && (
                          <span className="admin-dashboard__plan-badge admin-dashboard__plan-badge--inactive">
                            Inaktiv
                          </span>
                        )}
                        {plan.campaign && (
                          <span className="admin-dashboard__plan-badge admin-dashboard__plan-badge--campaign">
                            Kampagne
                          </span>
                        )}
                      </h3>
                      <p className="admin-dashboard__plan-meta">
                        {plan.provider} • {plan.data} • {plan.price} kr
                      </p>
                    </div>
                    <div className="admin-dashboard__plan-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(plan)}
                        icon={plan.isActive ? "eye-off" : "eye"}
                        title={plan.isActive ? "Deaktiver" : "Aktiver"}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                        icon="edit"
                      >
                        Rediger
                      </Button>
                    </div>
                  </div>
                  
                  <div className="admin-dashboard__plan-details">
                    <div className="admin-dashboard__plan-detail">
                      <strong>Earnings:</strong> {plan.earnings || 0} kr
                    </div>
                    {plan.campaignPrice && (
                      <div className="admin-dashboard__plan-detail">
                        <strong>Kampagnepris:</strong> {plan.campaignPrice} kr
                      </div>
                    )}
                    <div className="admin-dashboard__plan-detail">
                      <strong>Sorting:</strong> {plan.sortingOrder || 0}
                    </div>
                  </div>

                  {plan.campaign && (
                    <div className="admin-dashboard__plan-campaign">
                      <CampaignManager plan={plan} onUpdate={refetch} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
