Use:

node get-10k-random-images.js
node get-10k-images-info.js |& tee metadata.log
node conditioning-data-pre-image-search.js
node google_test.js

# Get values, quality, featured

# Change the type of image to download. output file name and target url
node --inspect-brk get-list-from-wikimedia-page.js
# Change the type of image to download. output file name and target url
node --inspect-brk get-images-info.js
# Destile information. Have a look to doc files for more info.
node --inspect-brk compare-seeds.js

# Option A
node --max-old-space-size=4096 google_test0.js

csv-generator.js
csv-generator-google-image-search.js


# Option B
# In case of run with Multiple Browsers
# multi-browser.js
node --inspect-brk  --max-old-space-size=4096 multi-browser.js

# Generate csv files
node --inspect-brk --max-old-space-size=4096 csv-generator-from-list.js
node --max-old-space-size=4096 csv-generator-google-image-search-from-list.js

# TODO

-get 11k normal images.

# DONE
filter:
  values
  qualityImages

Take 11k random normal, values, quality, featured.

Hacer un
