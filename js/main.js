var _ = require('underscore');
_.jQuery(jQuery);

module.exports = {
    'viewer': require('./viewer'),
    'thumbnails': require('./thumbnails'),
    'navigation': require('./navigation')
}