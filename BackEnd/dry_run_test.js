/**
 * dry_run_test.js
 * Mocks the database results and simulates the lesson.controller.js logic
 * to verify the fix for payment and progression locks.
 */

function simulateGetLessons(isPaid, isAdvanced, lessonsData, progressMap, role, studentId) {
    const canBypassLocks = role === 'admin' || role === 'teacher';
    const processedLessons = [];
    let previousCompleted = true;

    for (let i = 0; i < lessonsData.length; i++) {
        const l = lessonsData[i];
        
        // Payment Tier Logic
        let isPaymentLocked = false;
        if (!isPaid && !canBypassLocks) {
            if (isAdvanced) {
                isPaymentLocked = true;
            } else {
                isPaymentLocked = i >= 3;
            }
        }

        const isCompleted = !!progressMap[l.id];
        let isProgressionLocked = false;
        if (!canBypassLocks && studentId) {
            isProgressionLocked = !previousCompleted;
        }
        
        const isLocked = isPaymentLocked || isProgressionLocked;
        const requiresPayment = isPaymentLocked;

        processedLessons.push({
            id: l.id,
            title: l.title,
            isCompleted,
            isLocked,
            requiresPayment
        });

        // Update previous info for progression lock check
        previousCompleted = isCompleted || canBypassLocks;
    }
    return processedLessons;
}

// Test Data
const lessons = [
    { id: 101, title: "Lesson 1" },
    { id: 102, title: "Lesson 2" },
    { id: 103, title: "Lesson 3" },
    { id: 104, title: "Lesson 4" },
    { id: 105, title: "Lesson 5" },
];

console.log("=== SCENARIO 1: Student, Non-Advanced Course, Lessons 1-3 Completed ===");
const case1 = simulateGetLessons(false, false, lessons, { 101: true, 102: true, 103: true }, 'student', 1);
console.table(case1);
const l4 = case1.find(l => l.id === 104);
console.log(`Lesson 4 isLocked: ${l4.isLocked}, requiresPayment: ${l4.requiresPayment}`);
if (l4.isLocked && l4.requiresPayment) console.log("✅ PASS: Lesson 4 is correctly locked for payment.");
else console.log("❌ FAIL: Lesson 4 should be locked for payment.");

console.log("\n=== SCENARIO 2: Admin, Any Course, Nothing Completed ===");
const case2 = simulateGetLessons(false, true, lessons, {}, 'admin', null);
console.table(case2);
const allUnlocked = case2.every(l => !l.isLocked);
if (allUnlocked) console.log("✅ PASS: Admin has access to everything.");
else console.log("❌ FAIL: Admin should not have locks.");

console.log("\n=== SCENARIO 3: Student, Non-Advanced Course, Only Lesson 1 Completed ===");
const case3 = simulateGetLessons(false, false, lessons, { 101: true }, 'student', 1);
console.table(case3);
const l2 = case3.find(l => l.id === 102);
const l3 = case3.find(l => l.id === 103);
console.log(`Lesson 2 isLocked: ${l2.isLocked}, requiresPayment: ${l2.requiresPayment}`);
console.log(`Lesson 3 isLocked: ${l3.isLocked}, requiresPayment: ${l3.requiresPayment}`);
if (!l2.isLocked && l3.isLocked && !l3.requiresPayment) console.log("✅ PASS: Progression lock works correctly.");
else console.log("❌ FAIL: Progression lock failed logic.");
