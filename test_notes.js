const axios = require('axios');

// First, register and login to get a token
async function test() {
  try {
    // Register
    const registerRes = await axios.post('http://localhost:3000/api/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    console.log('Register response:', registerRes.data);
    
    const token = registerRes.data.data.token;
    const userId = registerRes.data.data.user.id;
    
    // Create a course
    const courseRes = await axios.post('http://localhost:3000/api/courses', 
      { title: 'Test Course', description: 'Test' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Course created:', courseRes.data);
    
    const courseId = courseRes.data.data.id;
    
    // Create a lecture
    const lectureRes = await axios.post('http://localhost:3000/api/lectures',
      { courseId, title: 'Test Lecture', content: 'Test content' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Lecture created:', lectureRes.data);
    
    const lectureId = lectureRes.data.data.id;
    
    // Create a note
    const noteRes = await axios.post(`http://localhost:3000/api/notes/${lectureId}`,
      { content: 'Test note' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Note created response:', noteRes.data);
    
    // Get notes
    const getNotesRes = await axios.get(`http://localhost:3000/api/notes/${lectureId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Get notes response:', getNotesRes.data);
    console.log('Response structure - response.data:', getNotesRes.data);
    console.log('Response structure - response.data.data:', getNotesRes.data.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
