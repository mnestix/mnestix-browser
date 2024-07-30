# Deployment Guide
Somemon knowing what he does should be able to deploy this app in 15 minutes.


## Helm Deployment Guide

Edit the values.yaml

```
env:
  REGISTRY_API_URL: 'http://localhost:8083'
  # -- URL to AAS registry API
  # e.g., https://aas.my.yacoub.de/api/aas-registry
  DISCOVERY_API_URL: 'http://mnestix-api-service:31323/discovery'
  # -- same as above for other AAS APIs
  AAS_REPO_API_URL: 'http://mnestix-api-service:31323/repo'
  # -- same as above for other AAS APIs
  MNESTIX_BACKEND_API_URL: 'http://mnestix-api-service:31323'
  # -- Backend URL of the AAS Management Service (Linh)
  # AD_CLIENT_ID: ${AD_CLIENT_ID}
  # 
  # AD_TENANT_ID: ${AD_TENANT_ID}
  # APPLICATION_ID_URI: 'api://mnestix-test-web-api/'
  # AAS_LIST_FEATURE_FLAG: true
  # COMPARISON_FEATURE_FLAG: true
  # AUTHENTICATION_FEATURE_FLAG: true
  # LOCK_TIMESERIES_PERIOD_FEATURE_FLAG: true
  THEME_PRIMARY_COLOR: '#0d4453'
  THEME_SECONDARY_COLOR: '#147f8a'
  # THEME_LOGO_URL: https://xitaso.com/wp-content/uploads/XITASO-Logo-quer.svg
```
