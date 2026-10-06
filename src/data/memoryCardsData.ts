
import matter from 'gray-matter';
import memoryCardCleanImage from '@/assets/images/game/memory-card_clean.png';
import memoryCardCleanImageWebP from '@/assets/images/game/memory-card_clean.webp';
import memoryCardKirbyImage from '@/assets/images/game/memory-card_kirby.png';
import memoryCardKirbyImageWebP from '@/assets/images/game/memory-card_kirby.webp';
import memoryCardDoubleVisionImage from '@/assets/images/game/memory-card_doubleVision.png';
import memoryCardDoubleVisionImageWebP from '@/assets/images/game/memory-card_doubleVision.webp';
import memoryCardSnake from '@/assets/images/game/memory-card_snake.png';
import memoryCardSnakeWebP from '@/assets/images/game/memory-card_snake.webp';
import memoryCardZeroDay from '@/assets/images/game/memory-card_zeroday.png';
import memoryCardZeroDayWebP from '@/assets/images/game/memory-card_zeroday.webp';
import memoryCardQuietAudit from '@/assets/images/game/memory-card_quietaudit.png';
import memoryCardQuietAuditWebP from '@/assets/images/game/memory-card_quietaudit.webp';

export interface MemoryCardData {
    id: string;
    title: string;
    size: string;
    image?: string;
    imageWebP?: string;
    color: string;
    type: 'game' | 'data' | 'config' | 'corrupt' | 'empty';
    description?: string;
    tags?: string[];
    github?: string;
    linkToPlay?: string;
    linkToCode?: string;
    playableEmbedUrl?: string;
    language?: string;
    baseId?: string;
}

const IMAGE_MAP: Record<string, { src: string; srcWebP: string }> = {
    'memory-card_clean.png': { src: memoryCardCleanImage, srcWebP: memoryCardCleanImageWebP },
    'memory-card_kirby.png': { src: memoryCardKirbyImage, srcWebP: memoryCardKirbyImageWebP },
    'memory-card_doubleVision.png': { src: memoryCardDoubleVisionImage, srcWebP: memoryCardDoubleVisionImageWebP },
    'memory-card_snake.png': { src: memoryCardSnake, srcWebP: memoryCardSnakeWebP },
    'memory-card_zeroday.png': { src: memoryCardZeroDay, srcWebP: memoryCardZeroDayWebP },
    'memory-card_quietaudit.png': { src: memoryCardQuietAudit, srcWebP: memoryCardQuietAuditWebP },
};

const markdownFiles = import.meta.glob('../content/games/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
});

const generatedCards: MemoryCardData[] = [];

Object.keys(markdownFiles).forEach((path) => {
    try {
        const rawContent = markdownFiles[path] as string;
        const { data: frontmatter, content: body } = matter(rawContent);

        const fileName = path.split('/').pop() || 'unknown';
        const id = fileName.replace('.md', '');

        // Parse filename for language: Name-Lang.md
        const langMatch = fileName.match(/^(.+)-([a-zA-Z]{2,5})\.md$/);
        const itemBaseId = langMatch ? langMatch[1] : id;
        const itemLanguage = langMatch ? langMatch[2] : 'en'; // Default to en if no match

        let imageResolved: string | undefined = undefined;
        let imageWebPResolved: string | undefined = undefined;

        if (frontmatter.image && IMAGE_MAP[frontmatter.image]) {
            imageResolved = IMAGE_MAP[frontmatter.image].src;
            imageWebPResolved = IMAGE_MAP[frontmatter.image].srcWebP;
        }

        generatedCards.push({
            id: id,
            title: frontmatter.title || 'Untitled',
            size: frontmatter.size || '—',
            image: imageResolved,
            imageWebP: imageWebPResolved,
            color: frontmatter.color || 'var(--gray-500)',
            type: (frontmatter.type as MemoryCardData['type']) || 'data',
            description: body.trim(),
            tags: frontmatter.tags || [],
            github: frontmatter.github,
            linkToPlay: frontmatter.linkToPlay,
            linkToCode: frontmatter.github,
            playableEmbedUrl: frontmatter.playableEmbedUrl || (
                itemBaseId === 'snake_game' || itemBaseId === 'cyber_threat_defense'
                    ? '/games/cyber-threat-defense/index.html'
                    : itemBaseId === 'zero_day_escape_room'
                    ? '/games/zero-day-escape-room/index.html'
                    : itemBaseId === 'quiet_audit'
                    ? '/games/quiet-audit/index.html'
                    : undefined
            ),
            language: itemLanguage,
            baseId: itemBaseId,
        });
    } catch (e) {
        console.warn(`Failed to parse memory card data from ${path}`, e);
    }
});


generatedCards.sort((a, b) => a.id.localeCompare(b.id));

if (generatedCards.length === 0) {
    generatedCards.push({
        id: 'no-data',
        title: 'No Data',
        size: '0KB',
        color: 'var(--red-500)',
        type: 'empty',
        description: 'No memory cards found.',
    });
}

export const MEMORY_CARDS: MemoryCardData[] = generatedCards;

export const getMemoryCardImage = (card: MemoryCardData) => {
    return card.image ?? memoryCardCleanImage;
};
