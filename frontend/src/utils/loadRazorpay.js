/**
 * Loads the Razorpay Checkout SDK script dynamically into the document
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If Razorpay is already available on window, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from remote CDN');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
