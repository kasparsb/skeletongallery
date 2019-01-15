var _ = require('underscore2');
_.jQuery(jQuery);

module.exports = {
    'viewer': require('./viewer'),
    'thumbnails': require('./thumbnails'),
    'navigation': require('./navigation')
}