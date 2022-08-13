const getTruncatedPubkey = (pubkey: string) => {
    const strlen = pubkey.length;

    return pubkey.substring(0, 6) + "..." + pubkey.substring(strlen - 6);
};

export { getTruncatedPubkey };
