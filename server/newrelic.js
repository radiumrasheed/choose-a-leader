'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['elektor'],
  /**
   * Your New Relic license key.
   */
  license_key: 'aaf10847b192e42bdc20009821255a3fc01cbad6',
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  },
  error_collector: {
    ignore_status_codes: [404, 400, 401, 402, 403, 409]
  }
};
