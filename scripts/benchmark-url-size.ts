import { ClientConfig, encode } from "../src/client-config";

const benchmarkValue: ClientConfig = {
  clientSecret:
    "ieZ4saiPeeshoh2ru9Neiph6jo8eicaesh3Xoo9re5fong3chiedee4noiz3mo3h",
  authorizeUrl: "https://api.example.com/oauth/authorize",
  tokenUrl: "https://api.example.com/oauth/token",
  refreshTokenUrl: "https://api.example.com/oauth/refresh",
  dataType: "json",
};

let count = 10_000;
let total = 0;
for (let i = 0; i < count; i++) {
  total += encode(benchmarkValue).length;
}
const result = total / count;
console.log("Benchmarked URL token size: " + result + " characters");
