import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBlockIds() {
    console.log('🔍 Checking for blocks with empty IDs...\n');

    const campaigns = await prisma.campaign.findMany({
        where: {
            content: {
                not: { equals: prisma.Prisma.JsonNull }
            }
        }
    });

    let totalFixed = 0;

    for (const campaign of campaigns) {
        const content: any = campaign.content;

        if (!content?.blocks) continue;

        const usedIds = new Set<string>();
        let fixedInCampaign = 0;

        const fixedBlocks = content.blocks.map((block: any) => {
            if (!block.id || block.id === '' || usedIds.has(block.id)) {
                fixedInCampaign++;
                const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                console.log(`  ❌ Block with ${block.id ? `duplicate ID "${block.id}"` : 'empty ID'} → ✅ ${newId}`);
                usedIds.add(newId);
                return { ...block, id: newId };
            }
            usedIds.add(block.id);
            return block;
        });

        if (fixedInCampaign > 0) {
            console.log(`\n📧 Campaign "${campaign.title}" (${campaign.id}): Fixed ${fixedInCampaign} blocks`);

            await prisma.campaign.update({
                where: { id: campaign.id },
                data: {
                    content: { ...content, blocks: fixedBlocks }
                }
            });

            totalFixed += fixedInCampaign;
        }
    }

    console.log(`\n✅ Fixed ${totalFixed} blocks across ${campaigns.length} campaigns`);

    if (totalFixed === 0) {
        console.log('✨ No blocks with empty/duplicate IDs found!');
    }
}

fixBlockIds()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
