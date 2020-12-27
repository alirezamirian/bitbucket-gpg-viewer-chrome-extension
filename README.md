# bitbucket-gpg-viewer-chrome-extension
A chrome extension for decoding and viewing pgp encoded files (.gpg) in bitbucket/stash.
It adds a "Decrypt" button to .gpg files, in both diff view (e.g. in PRs or in commit view) and in file view. 

**IMPORTANT**: it's not compatible to work on the latest version of bitbucket (with new atlassian UI).

**IMPORTANT**: It kind of heuristically detects bitbucket (aka stash) websites based on either subdomain or first path segment. So if domain name for your bitbucket server doesn't match with neither of those, then it won't work.

<img width="640" alt="Screenshot 2020-12-27 at 21 38 20" src="https://user-images.githubusercontent.com/3150694/103179992-c48d8980-4891-11eb-87a5-dd0c8775a4ae.png">

<img width="640" alt="Screenshot 2020-12-27 at 21 55 31" src="https://user-images.githubusercontent.com/3150694/103179716-f94c1180-488e-11eb-9a02-19961c8baa3b.png">

