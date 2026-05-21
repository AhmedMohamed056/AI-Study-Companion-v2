import { prisma } from './src/lib/prisma.js';

async function test() {
  try {
    const lecture = await prisma.lecture.create({
      data: {
        id: 'test-lecture-' + Date.now(),
        title: 'Test Lecture for Notes',
        content: 'Test content',
        courseId: 'cmoqx0i3d0001lajzu7ax4tm7',
        userId: 'cmoqwx8hy000013frg14fe621',
      },
    });
    console.log('Lecture created:', lecture.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
