const TradeLedger = artifacts.require("TradeLedger");
const assertFail = require("./helpers/assertFail");

let tradeLedger;

contract("TradeLedger", function(accounts) {

    console.log('Logging out all of the accounts for reference...');
    accounts.forEach(acc => console.log(acc));

    before(async function() {
        tradeLedger = await TradeLedger.new();
    });

    it('should add an account', async function() {
        await tradeLedger.addAccount("12345");
        const result = await tradeLedger.countAccounts.call();
        assert.equal(result.toNumber(), 1);
    });

    it('should get an account', async function() {
        const result = await tradeLedger.getAccount.call("12345");
        assert.equal(result[0], "12345");
        assert.equal(result[1].toNumber(), 0);
        assert.equal(result[2].toNumber(), 0);
        assert.equal(result[3].toNumber(), 0);
        assert.equal(result[4].toNumber(), 0);
        assert.equal(result[5].toNumber(), 0);
    });

    it('should add a position', async function() {
        await tradeLedger.addPosition("100", 'BASE64', 'BASE64', 'BASE64', 1, 1, '2017-01-01T11:00:00', 'BASE64', '12345');
        const result = await tradeLedger.countPositions.call();
        assert.equal(result.toNumber(), 1);
    });

    it('should fail to add a position with invalid account', async function() {
        await assertFail(async function() {
            await tradeLedger.addPosition("100", 'BASE64', 'BASE64', 'BASE64', 1, 1, '2017-01-01T11:00:00', 'BASE64', '88888');
            const result = await tradeLedger.countPositions.call();
            assert.equal(result.toNumber(), 1);
        });
    });

    it('should hide the keys at first', async function() {
        const result = await tradeLedger.getPosition.call("100");
        assert.equal(result[0], '100');
        assert.equal(result[1], 'TBC');
        assert.equal(result[2], 'TBC');
    });

    it('should release the public keys', async function() {
        await tradeLedger.releaseKeyPair('PRIVKEY', 'PUBKEY');
        const result = await tradeLedger.getPosition.call("100");
        assert.equal(result[0], '100');
        assert.equal(result[1], 'PRIVKEY');
        assert.equal(result[2], 'PUBKEY');
    });

    it('should fetch all positions', async function() {

    });

    it('should only allow the owner to call addPosition', async function() {});

    it('should only allow the owner to call releaseKeyPair', async function() {});
});