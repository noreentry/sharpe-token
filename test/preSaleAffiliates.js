const assertFail = require("./helpers/assertFail");
const assertions = require("./helpers/assertions");
const eventsUtil = require("./helpers/eventsUtil");
const testConfig = require("./helpers/testConfig");

contract("Presale affiliate bonuses", function(accounts) {

    before(async function() {
        await testConfig.setupForPreSale(accounts);
    });

    it('should initialize contract with expected values', async function() {
        await assertions.expectedInitialisation(
            testConfig.preSale, 
            {
                etherEscrowWallet: testConfig.etherEscrowWallet,
                reserveWallet: testConfig.reserveWallet,
                foundersWallet: testConfig.foundersWallet
            },
            {
                preSaleBegin: testConfig.preSaleBegin,
                preSaleEnd: testConfig.preSaleEnd,
                preSaleCap: testConfig.preSaleCap,
                minPresaleContributionEther: testConfig.minPresaleContributionEther,
                maxPresaleContributionEther: testConfig.maxPresaleContributionEther,
                firstTierDiscountUpperLimitEther: testConfig.firstTierDiscountUpperLimitEther,
                secondTierDiscountUpperLimitEther: testConfig.secondTierDiscountUpperLimitEther,
                thirdTierDiscountUpperLimitEther: testConfig.thirdTierDiscountUpperLimitEther
            }
        );
    });

    it('should whitelist an affiliate', async function() {
        await testConfig.affiliateUtility.addAffiliate(testConfig.contributorTwoAddress, testConfig.contributorTwoAddress);
        const affiliate = await testConfig.affiliateUtility.getAffiliate.call(testConfig.contributorTwoAddress, {
            from: testConfig.ownerAddress
        });
        assert.equal(affiliate, testConfig.contributorTwoAddress);
    });

    it('should deposit extra bonus with valid affiliate', async function() {

        let contribution = web3.toWei('50', 'ether');
        
        await testConfig.preSale.sendTransaction({
            value: contribution,
            from: testConfig.contributorOneAddress,
            data: testConfig.contributorTwoAddress
        });

        assertions.ether({
            etherEscrowBalance: 50,
            presaleBalance: 0,
            contributorOneBalance: 50,
            contributorTwoBalance: 100,
            reserveBalance: 0,
            foundersBalance: 0
        });
        await assertions.SHP({
            etherEscrowBalance: 0,
            presaleBalance: 0,
            contributorOneBalance: 111100,
            contributorTwoBalance: 5500,
            reserveBalance: 0,
            foundersBalance: 0,
            trusteeBalance: 125000,
            bountyBalance: 25000
        });
    });

    it('should not deposit extra when affiliate is invalid', async function() {

        let contribution = web3.toWei('25', 'ether');
        
        await testConfig.preSale.sendTransaction({
            value: contribution,
            from: testConfig.contributorOneAddress,
            data: testConfig.bountySignAddress
        });

        assertions.ether({
            etherEscrowBalance: 75,
            presaleBalance: 0,
            contributorOneBalance: 25,
            contributorTwoBalance: 100,
            reserveBalance: 0,
            foundersBalance: 0
        });
        await assertions.SHP({
            etherEscrowBalance: 0,
            presaleBalance: 0,
            contributorOneBalance: 166100,
            contributorTwoBalance: 5500,
            reserveBalance: 0,
            foundersBalance: 0,
            trusteeBalance: 187500,
            bountyBalance: 37500
        });
    });

    it('should reject deposits when the affiliate address is the same as msg.sender', async function() {
        
        let contribution = web3.toWei('25', 'ether');
        
        await assertFail(async function () {
            await testConfig.preSale.sendTransaction({
                value: contribution,
                from: testConfig.contributorTwoAddress,
                data: testConfig.contributorTwoAddress
            });
        });

        assertions.ether({
            etherEscrowBalance: 75,
            presaleBalance: 0,
            contributorOneBalance: 25,
            contributorTwoBalance: 100,
            reserveBalance: 0,
            foundersBalance: 0
        });
        await assertions.SHP({
            etherEscrowBalance: 0,
            presaleBalance: 0,
            contributorOneBalance: 166100,
            contributorTwoBalance: 5500,
            reserveBalance: 0,
            foundersBalance: 0,
            trusteeBalance: 187500,
            bountyBalance: 37500
        });
    });
});