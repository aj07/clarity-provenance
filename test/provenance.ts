import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";



// contract publisher signature
const contractSignature = "S1G2081040G2081040G2081040G208105NK8PE5";

// first owner
const owner1 = "SP2AYGM74FNMJT9M197EJSB49P88NRH0ES1KZD1BX";
// new Owner
const owner2 = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
// owner after that
const owner3 = "SPAXYA5XS51713FDTQ8H94EJ4V579CXMTRNBZKSF";


class ListClient extends Client {
    constructor(provider: Provider) {
        super(
            contractSignature + ".endless-list",
            "endless-list",
            provider
        );
    }
}

class ProvenanceClient extends Client {
    constructor(provider: Provider) {
        super(
            contractSignature + ".provenance",
            "provenance",
            provider
        );
    }
}

describe("provenance contract test suite", () => {
    let provider: Provider;
    let provenanceClient: ProvenanceClient;
    let endlessListClient: ListClient;

    describe("syntax tests", () => {

        before(async () => {
            provider = await ProviderRegistry.createProvider();
            endlessListClient = new ListClient(provider);
            provenanceClient = new ProvenanceClient(provider);
        });

        it("should have a valid syntax", async () => {
            await endlessListClient.checkContract();
            await endlessListClient.deployContract();
            await provenanceClient.checkContract();
            await provenanceClient.deployContract();
        });

        after(async () => {
            await provider.close();
        });
    });


    describe("deploying an instance of the contract", () => {

        before(async () => {
            provider = await ProviderRegistry.createProvider();
            endlessListClient = new ListClient(provider);
            provenanceClient = new ProvenanceClient(provider);
            await endlessListClient.deployContract();
            await provenanceClient.deployContract();
        });

        const getCurrentOwner = async () => {
            const query = provenanceClient.createQuery({
                method: { name: "get-current-owner", args: [] }
            });
            const receipt = await provenanceClient.submitQuery(query);
            const result = Result.unwrap(receipt);
            return result;
        }

        const getProvenance = async () => {
            const query = provenanceClient.createQuery({
                method: { name: "get-latest-provenance", args: [] }
            });
            const receipt = await provenanceClient.submitQuery(query);
            const result = Result.unwrap(receipt);
            return result;
        }

        const transferOwnership = async (current_owner: string, new_owner: string) => {
            const tx = provenanceClient.createTransaction({
                method: {
                    name: 'transfer-ownership',
                    args: ["'" + new_owner],
                },
            });
            await tx.sign(current_owner);
            const receipt = await provenanceClient.submitTransaction(tx);
            return receipt;
        }

        it("should start with some owner", async () => {
            const owner = await getCurrentOwner();
            assert.equal(owner, owner1);
        })

        it("should transfer ownership to a new owner", async () => {
           const receipt = await transferOwnership(owner1, owner2)
           assert.isTrue(receipt.success);
           // Ownership information has changed
            const owner = await getCurrentOwner();
            assert.equal(owner, owner2);
        })

        it("old owner cannot transfer ownership again", async () => {
            const receipt = await transferOwnership(owner1, owner3)
            assert.isFalse(receipt.success);
            // Ownership information has NOT changed
            const owner = await getCurrentOwner();
            assert.equal(owner, owner2)
        })

        it("but new owner can transfer ownership now", async () => {
            const owner = await getCurrentOwner();
            assert.equal(owner, owner2);
            // Ownership information has changed
            const receipt = await transferOwnership(owner2, owner3)
            assert.isTrue(receipt.success);
        })

        it("gets-provenance", async () => {
            const owners = await getProvenance();
            assert.equal(owners, "(" + owner1 + " " + owner2 + " " + owner3 +")");
        })

    });

    after(async () => {
        await provider.close();
    });
});