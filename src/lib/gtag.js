export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING

export const pageview = url => {
  window.gtag &&
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url
    })
}

const sanitizeUtm = str =>
  str ? String(str).replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 100) : ''

export const event = ({ action, category, label }) => {
  const urlParams = new URLSearchParams(window.location.search)
  let campaignData = {
    source: sanitizeUtm(urlParams.get('utm_source')) || 'direct',
    medium: sanitizeUtm(urlParams.get('utm_medium')) || 'none',
    campaign: sanitizeUtm(urlParams.get('utm_campaign')) || 'default'
  }

  if (urlParams.get('utm_source')) {
    localStorage.setItem('campaignData', JSON.stringify(campaignData))
  } else {
    try {
      const storedCampaign = localStorage.getItem('campaignData')
      if (storedCampaign) {
        campaignData = JSON.parse(storedCampaign)
      }
    } catch {
      localStorage.removeItem('campaignData')
    }
  }

  window.gtag &&
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      click_location: window?.location?.href,
      campaign: campaignData
    })
}
