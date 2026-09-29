# Romance discovery and filter sizing

Romance actions and the Romance detail category were present in both v3 and the current code. The category was omitted whenever the character had no eligible romantic actions. High affinity alone does not bypass the adult-age, attraction-preference, close-family, or marriage rules. Without the user's specific character/save, the exact restriction affecting their person cannot be identified.

- Non-relatives now retain a Romance category that explains unavailable courtship rather than hiding the category. Close relatives and the goose do not gain a new romance category.
- Eligible courtship still provides Flirt, Court, and Propose. Existing marriage/affair paths are preserved.
- Separate player/other attraction meters and concise guidance distinguish friendship affinity from romantic attraction.
- Courtship eligibility now shares its checks with the displayed reason; allowed relationships are unchanged.
- Do uses the same filter font size and padding as People. The previous 65-point row and 44-point button minimums were removed. Both filter rows prevent vertical flex shrinking.

Validation: 61 tests across romance UI, kinship, misdeeds, living-world migration, and persistent-world suites; TypeScript; web production export. In the compact browser preview, Do and People both measured approximately 28.75-point buttons and 49.12-point rows with 11.38 points of bottom clearance. Known → Romance showed the age restriction for Agnes, the player-preference restriction for Edwin, and active courtship for Joan. Court increased attraction from 0/0 to 7/12 and used one action in a disposable QA save. No native build was installed in this follow-up.
