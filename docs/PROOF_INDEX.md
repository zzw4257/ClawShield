# Proof Index

## Onchain Facts

- Contract Address: `0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Contract Explorer: `https://opbnb-testnet-scan.bnbchain.org/address/0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Submission TX Hash: `0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`
- TX Explorer: `https://opbnb-testnet-scan.bnbchain.org/tx/0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`

## Verification Commands

```bash
npm run verify:flow --workspace @clawshield/api
npm run verify:event --workspace @clawshield/api -- --txHash 0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77 --contractAddress 0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9 --out docs/verification/event-latest.json
npm run proof:refresh --workspace @clawshield/api
```

> `verify:flow` and `proof:refresh` will create a new onchain attestation tx. After running them, sync proof fields in submission docs before final upload.

## Artifact Paths

- `docs/verification/flow-latest.json`
- `docs/verification/event-latest.json`
- `docs/verification/STATUS.md`

## Final Submission Fields Mapping

- Contract Address:
  - `README.md` (`Judge Snapshot`)
  - `docs/JUDGE_PACKET.md` (`15-Second Snapshot`)
  - `docs/DORAHACKS_SUBMISSION_FINAL.md` (`Onchain Proof`)
- Proof TX Hash:
  - `README.md` (`Judge Snapshot`)
  - `docs/JUDGE_PACKET.md` (`15-Second Snapshot`)
  - `docs/DORAHACKS_SUBMISSION_FINAL.md` (`Onchain Proof`)
- Explorer Links:
  - `README.md`
  - `docs/PROOF_INDEX.md`
  - `docs/DORAHACKS_DESCRIPTION_PASTE.md`
- Verification Artifacts:
  - `docs/verification/flow-latest.json`
  - `docs/verification/event-latest.json`
  - `docs/verification/STATUS.md`
