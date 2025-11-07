import { useEffect, useState } from 'react';
import { api, type Stats } from '../services/api';
import { theme } from '../theme';

interface StatsPanelProps {
  onClose?: () => void;
}

export default function StatsPanel({}: StatsPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: theme.layout.headerHeight,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.grayBg,
      overflowY: 'auto',
    }}>
      {/* Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: theme.spacing['2xl'],
      }}>
          {isLoading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem',
            }}>
              <div style={{ position: 'relative', marginBottom: theme.spacing.xl }}>
                <div className="animate-spin" style={{
                  borderRadius: '9999px',
                  height: '64px',
                  width: '64px',
                  border: `4px solid ${theme.colors.grayBg}`,
                }}></div>
                <div className="animate-spin" style={{
                  borderRadius: '9999px',
                  height: '64px',
                  width: '64px',
                  border: `4px solid ${theme.colors.navy}`,
                  borderTopColor: 'transparent',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}></div>
              </div>
              <p style={{
                fontWeight: theme.typography.weightSemiBold,
                color: theme.colors.textMedium,
              }}>
                Loading statistics...
              </p>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: theme.colors.errorBg,
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.sm,
              border: `2px solid ${theme.colors.errorBorder}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: theme.spacing.md,
            }}>
              <svg style={{ width: '24px', height: '24px', color: theme.colors.error, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p style={{ fontWeight: theme.typography.weightBold, color: theme.colors.error }}>Error</p>
                <p style={{ fontSize: theme.typography.sizeSm, marginTop: theme.spacing.xs, color: theme.colors.textMedium }}>{error}</p>
              </div>
            </div>
          )}

          {stats && !isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing['2xl'] }}>
              {/* Header */}
              <section style={{
                backgroundColor: theme.colors.white,
                padding: theme.spacing.xl,
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${theme.colors.border}`,
              }}>
                <h2 style={{
                  fontFamily: theme.typography.fontHeading,
                  fontSize: theme.typography.size3Xl,
                  fontWeight: theme.typography.weightBold,
                  color: theme.colors.navy,
                  marginBottom: theme.spacing.sm,
                }}>
                  Statistics Dashboard
                </h2>
                <p style={{ color: theme.colors.textMedium, marginBottom: 0 }}>Comprehensive data analysis & insights</p>
              </section>
              {/* Overview Cards */}
              <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: theme.spacing.xl,
              }}>
                <div style={{
                  backgroundColor: theme.colors.white,
                  padding: theme.spacing.xl,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                    <div style={{
                      backgroundColor: theme.colors.navy,
                      padding: theme.spacing.md,
                      borderRadius: theme.borderRadius.sm,
                    }}>
                      <svg style={{ width: '32px', height: '32px', color: theme.colors.white }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 style={{
                      fontFamily: theme.typography.fontHeading,
                      fontSize: theme.typography.sizeLg,
                      fontWeight: theme.typography.weightBold,
                      color: theme.colors.navy,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Total Properties
                    </h3>
                  </div>
                  <p style={{
                    fontFamily: theme.typography.fontHeading,
                    fontSize: '3rem',
                    fontWeight: theme.typography.weightBold,
                    color: theme.colors.navy,
                  }}>
                    {stats.total_accommodations?.toLocaleString() || 0}
                  </p>
                </div>

                <div style={{
                  backgroundColor: theme.colors.white,
                  padding: theme.spacing.xl,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                    <div style={{
                      backgroundColor: theme.colors.navy,
                      padding: theme.spacing.md,
                      borderRadius: theme.borderRadius.sm,
                    }}>
                      <svg style={{ width: '32px', height: '32px', color: theme.colors.white }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 style={{
                      fontFamily: theme.typography.fontHeading,
                      fontSize: theme.typography.sizeLg,
                      fontWeight: theme.typography.weightBold,
                      color: theme.colors.navy,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Average Capacity
                    </h3>
                  </div>
                  <p style={{
                    fontFamily: theme.typography.fontHeading,
                    fontSize: '3rem',
                    fontWeight: theme.typography.weightBold,
                    color: theme.colors.navy,
                  }}>
                    {stats.average_capacity?.toFixed(1) || 0}
                  </p>
                </div>
              </section>

              {/* By Type */}
              {stats.by_modalidade && stats.by_modalidade.length > 0 && (
                <section style={{
                  backgroundColor: theme.colors.white,
                  padding: theme.spacing.xl,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <h3 style={{
                    fontFamily: theme.typography.fontHeading,
                    fontSize: theme.typography.size2Xl,
                    fontWeight: theme.typography.weightBold,
                    color: theme.colors.navy,
                    marginBottom: theme.spacing.xl,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                  }}>
                    <span style={{
                      backgroundColor: theme.colors.grayBg,
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.sm,
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: theme.colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </span>
                    By Property Type
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: theme.spacing.lg,
                  }}>
                    {stats.by_modalidade
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .map((item, idx) => (
                        <div key={idx} style={{
                          backgroundColor: theme.colors.grayBg,
                          padding: theme.spacing.xl,
                          borderRadius: theme.borderRadius.sm,
                        }}>
                          <p style={{
                            fontWeight: theme.typography.weightBold,
                            fontSize: theme.typography.sizeLg,
                            marginBottom: theme.spacing.sm,
                            color: theme.colors.textDark,
                          }}>
                            {item.modalidade}
                          </p>
                          <p style={{
                            fontFamily: theme.typography.fontHeading,
                            fontSize: '2.5rem',
                            fontWeight: theme.typography.weightBold,
                            color: theme.colors.navy,
                          }}>
                            {item.count?.toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* By District */}
              {stats.by_distrito && stats.by_distrito.length > 0 && (
                <section style={{
                  backgroundColor: theme.colors.white,
                  padding: theme.spacing.xl,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <h3 style={{
                    fontFamily: theme.typography.fontHeading,
                    fontSize: theme.typography.size2Xl,
                    fontWeight: theme.typography.weightBold,
                    color: theme.colors.navy,
                    marginBottom: theme.spacing.xl,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                  }}>
                    <span style={{
                      backgroundColor: theme.colors.grayBg,
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.sm,
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: theme.colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </span>
                    By District (Top 10)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {stats.by_distrito
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .slice(0, 10)
                      .map((item, idx) => {
                        const maxCount = stats.by_distrito![0]?.count || 1;
                        const percentage = ((item.count || 0) / maxCount) * 100;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: theme.colors.navy,
                              color: theme.colors.white,
                              fontWeight: theme.typography.weightBold,
                              borderRadius: theme.borderRadius.sm,
                              fontSize: theme.typography.sizeSm,
                            }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: theme.spacing.sm,
                              }}>
                                <span style={{
                                  fontSize: theme.typography.sizeSm,
                                  fontWeight: theme.typography.weightBold,
                                  color: theme.colors.textDark,
                                }}>
                                  {item.distrito}
                                </span>
                                <span style={{
                                  fontSize: theme.typography.sizeSm,
                                  fontWeight: theme.typography.weightBold,
                                  color: theme.colors.navy,
                                }}>
                                  {item.count?.toLocaleString()}
                                </span>
                              </div>
                              <div style={{
                                height: '12px',
                                backgroundColor: theme.colors.grayBg,
                                borderRadius: '999px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  height: '100%',
                                  backgroundColor: theme.colors.navy,
                                  borderRadius: '999px',
                                  width: `${percentage}%`,
                                }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* By Municipality */}
              {stats.by_concelho && stats.by_concelho.length > 0 && (
                <section style={{
                  backgroundColor: theme.colors.white,
                  padding: theme.spacing.xl,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <h3 style={{
                    fontFamily: theme.typography.fontHeading,
                    fontSize: theme.typography.size2Xl,
                    fontWeight: theme.typography.weightBold,
                    color: theme.colors.navy,
                    marginBottom: theme.spacing.xl,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                  }}>
                    <span style={{
                      backgroundColor: theme.colors.grayBg,
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.sm,
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: theme.colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    By Municipality (Top 15)
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: theme.spacing.md,
                  }}>
                    {stats.by_concelho
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .slice(0, 15)
                      .map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: theme.colors.grayBg,
                          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                          borderRadius: theme.borderRadius.sm,
                        }}>
                          <span style={{
                            fontSize: theme.typography.sizeSm,
                            fontWeight: theme.typography.weightBold,
                            color: theme.colors.textDark,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.concelho}
                          </span>
                          <span style={{
                            fontSize: theme.typography.sizeBase,
                            fontWeight: theme.typography.weightBold,
                            color: theme.colors.navy,
                            marginLeft: theme.spacing.md,
                          }}>
                            {item.count?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
