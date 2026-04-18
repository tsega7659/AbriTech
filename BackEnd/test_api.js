async function testApi() {
  try {
    const resCourses = await fetch('http://localhost:5000/api/courses');
    console.log("--- Courses Test Status:", resCourses.status, "---");
    const coursesData = await resCourses.json();
    if (coursesData.length > 0) {
      console.log(JSON.stringify(coursesData[0], null, 2));
      const course = coursesData[0];
      if ('isFree' in course || 'discountPrice' in course || 'hasScholarship' in course) {
        console.log("SUCCESS: camelCase columns found in course response!");
      } else {
        console.log("FAILED: camelCase columns missing in course response.");
      }
    } else {
      console.log("No courses found to test.");
    }

    const resBlogs = await fetch('http://localhost:5000/api/blogs');
    console.log("\n--- Blogs Test Status:", resBlogs.status, "---");
    const blogsData = await resBlogs.json();
    if (blogsData.length > 0) {
      console.log(JSON.stringify(blogsData[0], null, 2));
      const blog = blogsData[0];
      if ('coverImage' in blog || 'isPublished' in blog || 'createdBy' in blog) {
        console.log("SUCCESS: camelCase columns found in blog response!");
      } else {
        console.log("FAILED: camelCase columns missing in blog response.");
      }
    } else {
      console.log("No blogs found to test.");
    }

  } catch (err) {
    console.error("API Test Error:", err);
  }
}

testApi();
