CURRENT_PATH=$(dirname "$0")
PROJECT_PATH="$CURRENT_PATH/.."

DIST_PATH="$PROJECT_PATH/lib/esm"

cd $DIST_PATH || exit 1
# TODO uncomment this and find a way to test esm module import
# node index.js
