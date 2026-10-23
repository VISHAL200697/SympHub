import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';

import User from './models/User.js';
import { Department, Category } from './models/Lookup.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Resetting database collections...');
    await mongoose.connection.db.dropDatabase();

    console.log('Seeding Departments...');
    const depts = await Department.insertMany([
      { name: 'Computer Science & Engineering' },
      { name: 'Electronics & Communication Engineering' },
      { name: 'Mechanical Engineering' },
      { name: 'Information Technology' },
      { name: 'Biomedical & Life Sciences' },
    ]);

    const deptMap = {};
    depts.forEach((d) => (deptMap[d.name] = d._id));

    console.log('Seeding Categories...');
    const cats = await Category.insertMany([
      { name: 'Technical' },
      { name: 'Workshop' },
      { name: 'Hackathon' },
      { name: 'Seminar' },
      { name: 'Cultural' },
      { name: 'Exhibition' },
    ]);

    const catMap = {};
    cats.forEach((c) => (catMap[c.name] = c._id));

    console.log('Seeding Users (Admin, Organizers, Students)...');

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@symposium.edu',
      password: 'AdminPass123!',
      role: 'admin',
      department: 'Computer Science & Engineering',
      is_active: true,
    });

    const org1 = await User.create({
      name: 'Prof. Alan Turing',
      email: 'organizer.cs@symposium.edu',
      password: 'OrgPass123!',
      role: 'organizer',
      department: 'Computer Science & Engineering',
      is_active: true,
    });

    const org2 = await User.create({
      name: 'Dr. Claude Shannon',
      email: 'organizer.ece@symposium.edu',
      password: 'OrgPass123!',
      role: 'organizer',
      department: 'Electronics & Communication Engineering',
      is_active: true,
    });

    const students = await User.create([
      {
        name: 'Alice Johnson',
        email: 'student1@symposium.edu',
        password: 'StudentPass123!',
        role: 'student',
        department: 'Computer Science & Engineering',
        is_active: true,
      },
      {
        name: 'Bob Smith',
        email: 'student2@symposium.edu',
        password: 'StudentPass123!',
        role: 'student',
        department: 'Information Technology',
        is_active: true,
      },
      {
        name: 'Carol Danvers',
        email: 'student3@symposium.edu',
        password: 'StudentPass123!',
        role: 'student',
        department: 'Electronics & Communication Engineering',
        is_active: true,
      },
      {
        name: 'David Miller',
        email: 'student4@symposium.edu',
        password: 'StudentPass123!',
        role: 'student',
        department: 'Mechanical Engineering',
        is_active: true,
      },
      {
        name: 'Eva Green',
        email: 'student5@symposium.edu',
        password: 'StudentPass123!',
        role: 'student',
        department: 'Computer Science & Engineering',
        is_active: true,
      },
    ]);

    console.log('Seeding 10 Sample Events with realistic RSVP counts...');
    const now = new Date();

    const sampleEvents = [
      {
        title: 'National AI & Generative LLMs Symposium 2026',
        description:
          'Annual flagship symposium featuring keynotes on Deep Learning, Generative AI, Large Language Models, and Computer Vision from industry leaders at Google, OpenAI & Microsoft.',
        category_id: catMap['Technical'],
        department_id: deptMap['Computer Science & Engineering'],
        organizer_id: org1._id,
        venue: 'Main Auditorium, Block A',
        event_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        event_time: '09:30 AM - 04:30 PM',
        registration_deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        max_capacity: 50,
        registered_students: [students[0]._id, students[1]._id, students[2]._id],
      },
      {
        title: 'Full-Stack MERN Web Development Masterclass',
        description:
          'Intensive 1-day practical workshop on building modern web applications with MongoDB, Express.js, React, and Node.js.',
        category_id: catMap['Workshop'],
        department_id: deptMap['Computer Science & Engineering'],
        organizer_id: org1._id,
        venue: 'Software Lab 3, CS Department',
        event_date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        event_time: '10:00 AM - 01:00 PM',
        registration_deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        max_capacity: 30,
        registered_students: [students[0]._id, students[3]._id],
      },
      {
        title: 'IoT & Autonomous Robotics 24-Hour Hackathon',
        description:
          'Build innovative IoT solutions, smart sensors, and autonomous robotics projects with microcontrollers, Arduino, and Raspberry Pi.',
        category_id: catMap['Hackathon'],
        department_id: deptMap['Electronics & Communication Engineering'],
        organizer_id: org2._id,
        venue: 'Innovation Hub, ECE Block',
        event_date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        event_time: '09:00 AM - Next Day 09:00 AM',
        registration_deadline: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        max_capacity: 20,
        registered_students: [students[1]._id, students[4]._id],
      },
      {
        title: 'Quantum Computing & Post-Quantum Cyber Security Seminar',
        description:
          'Distinguished lecture exploring post-quantum cryptography, quantum algorithms, Qiskit simulations, and cybersecurity defense strategies.',
        category_id: catMap['Seminar'],
        department_id: deptMap['Information Technology'],
        organizer_id: org1._id,
        venue: 'Seminar Hall 2, IT Block',
        event_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        event_time: '02:00 PM - 05:00 PM',
        registration_deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        max_capacity: 60,
        registered_students: [students[2]._id],
      },
      {
        title: 'VLSI Chip Fabrication & Microelectronics Hands-On',
        description:
          'Hands-on tutorial covering Cadence EDA tools, CMOS logic design, semiconductor layout, and microchip manufacturing processes.',
        category_id: catMap['Workshop'],
        department_id: deptMap['Electronics & Communication Engineering'],
        organizer_id: org2._id,
        venue: 'VLSI Design Lab, ECE Dept',
        event_date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        event_time: '10:00 AM - 04:00 PM',
        registration_deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        max_capacity: 25,
        registered_students: [students[0]._id, students[2]._id, students[4]._id],
      },
      {
        title: 'Inter-College CAD Modeling & Drone Dynamics Expo',
        description:
          'Exhibition showcasing SolidWorks CAD models, autonomous FPV drones, line-follower bots, and Mechatronics prototypes.',
        category_id: catMap['Exhibition'],
        department_id: deptMap['Mechanical Engineering'],
        organizer_id: org2._id,
        venue: 'Mechanical Workshop Hall',
        event_date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        event_time: '09:00 AM - 05:00 PM',
        registration_deadline: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
        max_capacity: 40,
        registered_students: [students[3]._id],
      },
      {
        title: 'Cloud Native DevOps & Kubernetes Cluster Deployment',
        description:
          'Comprehensive session on Docker containerization, Kubernetes cluster management, Helm charts, and GitHub Actions CI/CD pipelines.',
        category_id: catMap['Workshop'],
        department_id: deptMap['Information Technology'],
        organizer_id: org1._id,
        venue: 'Virtual Room 1 (Online)',
        event_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        event_time: '06:00 PM - 09:00 PM',
        registration_deadline: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        max_capacity: 100,
        registered_students: [],
      },
      {
        title: 'Biomedical Signal Processing & Brain-Computer Interface Seminar',
        description:
          'Specialist lecture on EEG signal filtering, neural decoding, BCI hardware integration, and medical device innovation.',
        category_id: catMap['Seminar'],
        department_id: deptMap['Biomedical & Life Sciences'],
        organizer_id: org2._id,
        venue: 'Biomedical Conference Center',
        event_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        event_time: '11:00 AM - 02:00 PM',
        registration_deadline: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
        max_capacity: 45,
        registered_students: [students[1]._id, students[3]._id],
      },
      {
        title: 'Annual College Cultural & Music Fest "Euphoria 2026"',
        description:
          'Inter-departmental battle of the bands, classical dance performances, theatrical drama, and acoustic music night.',
        category_id: catMap['Cultural'],
        department_id: deptMap['Computer Science & Engineering'],
        organizer_id: org1._id,
        venue: 'Open Air Amphitheatre',
        event_date: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        event_time: '04:00 PM - 10:00 PM',
        registration_deadline: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
        max_capacity: 200,
        registered_students: [students[0]._id, students[1]._id, students[2]._id, students[3]._id, students[4]._id],
      },
      {
        title: 'EV Powertrain & Battery Management Systems Workshop',
        description:
          'Practical workshop on Electric Vehicle motor control, Lithium-ion thermal management, regenerative braking systems, and EV simulation.',
        category_id: catMap['Workshop'],
        department_id: deptMap['Mechanical Engineering'],
        organizer_id: org2._id,
        venue: 'Automobile Engineering Lab',
        event_date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        event_time: '09:30 AM - 03:30 PM',
        registration_deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        max_capacity: 35,
        registered_students: [students[2]._id, students[4]._id],
      },
    ];

    for (const item of sampleEvents) {
      const regStudents = item.registered_students;
      delete item.registered_students;

      const seatsLeft = item.max_capacity - regStudents.length;

      const createdEvent = await Event.create({
        ...item,
        seats_remaining: seatsLeft,
        status: 'published',
      });

      for (const sId of regStudents) {
        await Registration.create({
          event_id: createdEvent._id,
          student_id: sId,
          status: 'confirmed',
          registered_at: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        });
      }
    }

    console.log('✅ Successfully seeded MongoDB database with 10 demo events!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding MongoDB:', error);
    process.exit(1);
  }
};

seedData();
