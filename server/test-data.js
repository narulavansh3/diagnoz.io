import db from './db.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const insertTestData = async () => {
  try {
    // Clear existing data first
    await db.transaction(async () => {
      await db.run('DELETE FROM reports');
      await db.run('DELETE FROM cases');
      await db.run('DELETE FROM radiologists');
      await db.run('DELETE FROM centers');
      await db.run('DELETE FROM users');
    });

    // Create test radiologists
    const radiologists = [
      {
        email: 'neuro@rad.com',
        password: 'password123',
        name: 'Dr. John Smith',
        qualification: 'MD Radiology, DNB Neuro',
        specialization: 'Neuroradiology',
        licenseNumber: 'RAD001',
        experience: 10,
        phone: '1234567890',
        specialties: ['MRI Brain', 'CT Head', 'MRA', 'Spine Imaging']
      },
      {
        email: 'cardiac@rad.com',
        password: 'password123',
        name: 'Dr. Sarah Johnson',
        qualification: 'MD Radiology, Fellowship Cardiac Imaging',
        specialization: 'Cardiac Radiology',
        licenseNumber: 'RAD002',
        experience: 8,
        phone: '2345678901',
        specialties: ['Cardiac CT', 'Cardiac MRI', 'Chest X-ray', 'Nuclear Cardiology']
      },
      {
        email: 'msk@rad.com',
        password: 'password123',
        name: 'Dr. Michael Chen',
        qualification: 'MD Radiology, Fellowship MSK',
        specialization: 'Musculoskeletal',
        licenseNumber: 'RAD003',
        experience: 12,
        phone: '3456789012',
        specialties: ['Joint MRI', 'Sports Imaging', 'Bone Scans', 'Arthography']
      },
      {
        email: 'pediatric@rad.com',
        password: 'password123',
        name: 'Dr. Emily Rodriguez',
        qualification: 'MD Radiology, Fellowship Pediatric',
        specialization: 'Pediatric Radiology',
        licenseNumber: 'RAD004',
        experience: 15,
        phone: '4567890123',
        specialties: ['Pediatric CT', 'Pediatric MRI', 'Pediatric X-ray', 'Pediatric Ultrasound']
      },
      {
        email: 'breast@rad.com',
        password: 'password123',
        name: 'Dr. Lisa Wong',
        qualification: 'MD Radiology, Fellowship Breast Imaging',
        specialization: 'Breast Imaging',
        licenseNumber: 'RAD005',
        experience: 9,
        phone: '5678901234',
        specialties: ['Mammography', 'Breast MRI', 'Breast Ultrasound', 'Breast Biopsy']
      }
    ];

    // Create test centers
    const centers = [
      {
        email: 'city@imaging.com',
        password: 'password123',
        name: 'City Imaging Center',
        address: '123 Main Street, Downtown, NY 10001',
        phone: '9876543210',
        license: 'CEN001'
      },
      {
        email: 'metro@scan.com',
        password: 'password123',
        name: 'Metro Scan & Diagnostics',
        address: '456 Park Avenue, Midtown, NY 10022',
        phone: '8765432109',
        license: 'CEN002'
      }
    ];

    // Insert test data
    for (const rad of radiologists) {
      const userId = randomUUID();
      const radiologistId = randomUUID();
      const hashedPassword = await bcrypt.hash(rad.password, 10);

      await db.run(
        'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
        [userId, rad.email, hashedPassword, 'RADIOLOGIST']
      );

      await db.run(
        `INSERT INTO radiologists (
          id, user_id, name, qualification, specialization,
          license_number, experience, phone, specialties,
          is_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          radiologistId,
          userId,
          rad.name,
          rad.qualification,
          rad.specialization,
          rad.licenseNumber,
          rad.experience,
          rad.phone,
          JSON.stringify(rad.specialties),
          false // Initially not available
        ]
      );
    }

    const centerIds = [];
    for (const center of centers) {
      const userId = randomUUID();
      const centerId = randomUUID();
      const hashedPassword = await bcrypt.hash(center.password, 10);

      await db.run(
        'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
        [userId, center.email, hashedPassword, 'CENTER']
      );

      await db.run(
        'INSERT INTO centers (id, user_id, name, address, phone, license) VALUES (?, ?, ?, ?, ?, ?)',
        [centerId, userId, center.name, center.address, center.phone, center.license]
      );
      
      centerIds.push({ userId, centerId });
    }

    // Create sample cases for each center
    const cases = [
      // Cases for City Imaging Center
      {
        centerId: centerIds[0].userId,
        cases: [
          {
            patientName: 'John Doe',
            patientAge: 45,
            modality: 'MRI Brain',
            imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc',
            clinicalHistory: 'Persistent headaches and dizziness for 2 weeks',
            priority: 'URGENT',
            status: 'PENDING'
          },
          {
            patientName: 'Mary Smith',
            patientAge: 62,
            modality: 'Cardiac CT',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
            clinicalHistory: 'Chest pain and shortness of breath',
            priority: 'EMERGENCY',
            status: 'PENDING'
          },
          {
            patientName: 'Sarah Johnson',
            patientAge: 35,
            modality: 'Mammography',
            imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67',
            clinicalHistory: 'Routine screening',
            priority: 'ROUTINE',
            status: 'PENDING'
          },
          {
            patientName: 'Michael Brown',
            patientAge: 28,
            modality: 'Joint MRI',
            imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8',
            clinicalHistory: 'Sports injury to right knee',
            priority: 'URGENT',
            status: 'PENDING'
          },
          {
            patientName: 'Emily Davis',
            patientAge: 8,
            modality: 'Pediatric CT',
            imageUrl: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c',
            clinicalHistory: 'Persistent abdominal pain',
            priority: 'EMERGENCY',
            status: 'PENDING'
          }
        ]
      },
      // Cases for Metro Scan & Diagnostics
      {
        centerId: centerIds[1].userId,
        cases: [
          {
            patientName: 'Robert Wilson',
            patientAge: 55,
            modality: 'Cardiac MRI',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
            clinicalHistory: 'Follow-up after cardiac surgery',
            priority: 'URGENT',
            status: 'PENDING'
          },
          {
            patientName: 'Lisa Anderson',
            patientAge: 42,
            modality: 'Breast MRI',
            imageUrl: 'https://images.unsplash.com/photo-1579154204600-3e8c8e5f3dc0',
            clinicalHistory: 'Suspicious mammogram findings',
            priority: 'EMERGENCY',
            status: 'PENDING'
          },
          {
            patientName: 'James Taylor',
            patientAge: 15,
            modality: 'Pediatric MRI',
            imageUrl: 'https://images.unsplash.com/photo-1581595220892-2d0d35707d4e',
            clinicalHistory: 'Chronic headaches',
            priority: 'ROUTINE',
            status: 'PENDING'
          },
          {
            patientName: 'Patricia Martinez',
            patientAge: 68,
            modality: 'CT Head',
            imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
            clinicalHistory: 'Recent fall with head injury',
            priority: 'EMERGENCY',
            status: 'PENDING'
          },
          {
            patientName: 'David Thompson',
            patientAge: 50,
            modality: 'Spine Imaging',
            imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8',
            clinicalHistory: 'Lower back pain with radiculopathy',
            priority: 'URGENT',
            status: 'PENDING'
          }
        ]
      }
    ];

    // Insert all cases
    for (const centerCases of cases) {
      for (const case_ of centerCases.cases) {
        const caseId = randomUUID();
        await db.run(
          `INSERT INTO cases (
            id, patient_name, patient_age, modality,
            image_url, clinical_history, priority,
            status, creator_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            caseId,
            case_.patientName,
            case_.patientAge,
            case_.modality,
            case_.imageUrl,
            case_.clinicalHistory,
            case_.priority,
            case_.status,
            centerCases.centerId
          ]
        );
      }
    }

    return { success: true, message: 'Test data inserted successfully' };
  } catch (error) {
    console.error('Error inserting test data:', error);
    throw error;
  }
};

export default insertTestData;