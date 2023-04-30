

const path = require("path");

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals.map((external) => {
        if (typeof external === "function") {
          return ({ context, request }, callback) => {
            if (request === "sharp") {
              return callback(null, "commonjs " + request);
            }
            return external({ context, request }, callback);
          };
        }
        return external;
      });
    }

    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    return config;
  },
};
