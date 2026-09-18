import { PrismaClient, UserRole, ScreenStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de base de datos (seeding)...');

  // 1. Crear Organización por defecto
  const organization = await prisma.organization.upsert({
    where: { slug: 'foodscreen-demo' },
    update: {},
    create: {
      id: 'org-demo-001',
      name: 'FoodScreen Demo Org',
      slug: 'foodscreen-demo',
      logoUrl: 'https://placeholder.co/150',
    },
  });
  console.log(`✅ Organización lista: ${organization.name} (${organization.id})`);

  // 2. Crear Ubicación por defecto
  const location = await prisma.location.upsert({
    where: { id: 'loc-demo-001' },
    update: {},
    create: {
      id: 'loc-demo-001',
      name: 'Sucursal Centro Principal',
      address: 'Av. Corrientes 1234',
      organizationId: organization.id,
    },
  });
  console.log(`✅ Ubicación lista: ${location.name} (${location.id})`);

  // 3. Crear Usuario Administrador por defecto
  const user = await prisma.user.upsert({
    where: { email: 'admin@foodscreen.tv' },
    update: {
      organizationId: organization.id,
    },
    create: {
      id: 'usr-demo-001',
      email: 'admin@foodscreen.tv',
      name: 'Administrador General',
      role: UserRole.ADMIN,
      organizationId: organization.id,
    },
  });
  console.log(`✅ Usuario Admin listo: ${user.email} (${user.id})`);

  // 4. Crear Pantalla / TV Box por defecto
  const screen = await prisma.screen.upsert({
    where: { deviceId: 'TVBOX-DEMO-001' },
    update: {},
    create: {
      id: 'screen-demo-001',
      name: 'TV Box Salón Principal',
      deviceId: 'TVBOX-DEMO-001',
      locationId: location.id,
      status: ScreenStatus.ONLINE,
      resolution: '1920x1080',
      currentVersion: '1.0.0',
      lastSeenAt: new Date(),
    },
  });
  console.log(`✅ Pantalla lista: ${screen.name} (${screen.deviceId})`);

  // 5. Crear Playlist por defecto
  const playlist = await prisma.playlist.upsert({
    where: { id: 'playlist-demo-001' },
    update: {},
    create: {
      id: 'playlist-demo-001',
      name: 'Playlist Promociones Mediodía',
      description: 'Promociones dinámicas de almuerzo y postres',
      locationId: location.id,
      isActive: true,
    },
  });
  console.log(`✅ Playlist lista: ${playlist.name} (${playlist.id})`);

  console.log('🎉 Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra de base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
