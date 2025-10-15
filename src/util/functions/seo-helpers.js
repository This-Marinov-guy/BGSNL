/**
 * SEO and Accessibility Helper Functions
 */

/**
 * Get social media platform name from URL
 * Used for aria-labels on social media links
 */
export const getSocialPlatformName = (url) => {
  if (!url) return 'Social Media';
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('instagram')) return 'Instagram';
  if (urlLower.includes('facebook')) return 'Facebook';
  if (urlLower.includes('linkedin')) return 'LinkedIn';
  if (urlLower.includes('twitter') || urlLower.includes('x.com')) return 'Twitter';
  if (urlLower.includes('flickr')) return 'Flickr';
  if (urlLower.includes('youtube')) return 'YouTube';
  if (urlLower.includes('tiktok')) return 'TikTok';
  if (urlLower.includes('whatsapp')) return 'WhatsApp';
  if (urlLower.includes('mailto:')) return 'Email';
  if (urlLower.includes('gofund')) return 'GoFundMe';
  
  return 'Social Media';
};

/**
 * Generate aria-label for social media link
 */
export const getSocialAriaLabel = (url, region = '') => {
  const platform = getSocialPlatformName(url);
  const regionText = region ? ` ${region.replace('_', ' ')}` : '';
  return `Visit Bulgarian Society${regionText} on ${platform}`;
};

