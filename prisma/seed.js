import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de datos...');

    try {
        // Limpiar datos existentes
        console.log('🗑️  Limpiando datos existentes...');
        await prisma.estudioAdjunto.deleteMany({});
        await prisma.documento.deleteMany({});
        await prisma.historiaClinica.deleteMany({});
        await prisma.sesion.deleteMany({});
        await prisma.turno.deleteMany({});
        await prisma.cita.deleteMany({});
        await prisma.paciente.deleteMany({});
        await prisma.usuario.deleteMany({});

        // Crear usuarios de prueba
        console.log('👤 Creando usuarios...');
        const adminPassword = await hashPassword('password123');
        const doctorPassword = await hashPassword('password123');
        const secretariaPassword = await hashPassword('password123');

        const admin = await prisma.usuario.create({
            data: {
                email: 'admin@lemes.com',
                password_hash: adminPassword,
                nombre: 'Juan',
                apellido: 'Administrador',
                rol: 'ROLE_ADMIN',
                estado: 'activo',
            },
        });

        const doctor = await prisma.usuario.create({
            data: {
                email: 'doctor@lemes.com',
                password_hash: doctorPassword,
                nombre: 'Carlos',
                apellido: 'García',
                rol: 'ROLE_DOCTOR',
                estado: 'activo',
            },
        });

        const secretaria = await prisma.usuario.create({
            data: {
                email: 'secretaria@lemes.com',
                password_hash: secretariaPassword,
                nombre: 'María',
                apellido: 'López',
                rol: 'ROLE_SECRETARIA',
                estado: 'activo',
            },
        });

        console.log('✅ Usuarios creados');

        // Crear pacientes de prueba
        console.log('🏥 Creando pacientes...');
        const pacientes = [];

        for (let i = 1; i <= 5; i++) {
            const paciente = await prisma.paciente.create({
                data: {
                    usuario_id: secretaria.id,
                    dni: `${10000000 + i}`,
                    nombre: `Paciente${i}`,
                    apellido: `Test${i}`,
                    fecha_nacimiento: new Date(`1990-0${i}-15`),
                    sexo: i % 2 === 0 ? 'M' : 'F',
                    peso: 70 + i,
                    talla: 170 + i,
                    grupo_sanguineo: 'O+',
                    telefono: `555000${i}`,
                    direccion: `Calle ${i} ${100 + i}`,
                    ciudad: 'Buenos Aires',
                },
            });
            pacientes.push(paciente);
        }

        console.log('✅ Pacientes creados');

        // Crear turnos
        console.log('📅 Creando turnos...');
        const hoy = new Date();

        for (let i = 0; i < 5; i++) {
            const fecha = new Date(hoy);
            fecha.setHours(9 + i);
            const estado = i < 2 ? 'atendido' : i < 4 ? 'pendiente' : 'confirmado';

            await prisma.turno.create({
                data: {
                    paciente_id: pacientes[i].id,
                    medico_id: doctor.id,
                    fecha_hora: fecha,
                    estado,
                    motivo: `Consulta de control ${i + 1}`,
                },
            });
        }

        console.log('✅ Turnos creados');

        // Crear historias clínicas
        console.log('📋 Creando historias clínicas...');

        for (let i = 0; i < 3; i++) {
            const imc = pacientes[i].peso / ((pacientes[i].talla / 100) ** 2);

            await prisma.historiaClinica.create({
                data: {
                    paciente_id: pacientes[i].id,
                    diagnostico: `Paciente en buen estado general. Síntomas menores.`,
                    peso: pacientes[i].peso,
                    talla: pacientes[i].talla,
                    imc: parseFloat(imc.toFixed(2)),
                    presion_arterial: '120/80',
                    frecuencia_cardiaca: 72,
                    temperatura: 36.8,
                    saturacion_oxigeno: 98,
                    medicamentos: 'Paracetamol 500mg',
                    observaciones: 'Paciente refiere bienestar general',
                },
            });
        }

        console.log('✅ Historias clínicas creadas');

        // Crear sesiones de prueba
        console.log('🔐 Creando sesiones de prueba...');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await prisma.sesion.create({
            data: {
                usuario_id: admin.id,
                token_sesion: 'test_admin_token_12345',
                fecha_expiracion: expiresAt,
                ip_address: '127.0.0.1',
                activa: true,
            },
        });

        console.log('✅ Sesiones de prueba creadas');

        console.log('');
        console.log('╔════════════════════════════════════════╗');
        console.log('║   ✅ SEED COMPLETADO EXITOSAMENTE    ║');
        console.log('╠════════════════════════════════════════╣');
        console.log('║ Usuarios de prueba:                  ║');
        console.log('║ • admin@lemes.com (ROLE_ADMIN)       ║');
        console.log('║ • doctor@lemes.com (ROLE_DOCTOR)     ║');
        console.log('║ • secretaria@lemes.com (ROLE_SECRETARIA) ║');
        console.log('║ Contraseña: password123              ║');
        console.log('║                                      ║');
        console.log('║ • 5 Pacientes                        ║');
        console.log('║ • 5 Turnos                           ║');
        console.log('║ • 3 Historias clínicas               ║');
        console.log('╚════════════════════════════════════════╝');
        console.log('');
    } catch (error) {
        console.error('❌ Error al ejecutar seed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
