async function runTests() {
  const BASE_URL = 'http://localhost:3000';
  console.log('=== TEST 1: Verificación de SPA estática compilada (GET /) ===');
  const resSpa = await fetch(`${BASE_URL}/`);
  console.log(`Status: ${resSpa.status} ${resSpa.statusText}`);
  const html = await resSpa.text();
  console.log(`Respuesta contiene HTML: ${html.includes('<!DOCTYPE html>') || html.includes('<html')}`);

  console.log('\n=== TEST 2: Acceso no autenticado (GET /api/admin/status SIN token) ===');
  const resUnauth = await fetch(`${BASE_URL}/api/admin/status`);
  console.log(`Status esperado 401: Obtenido ${resUnauth.status}`);
  const dataUnauth = await resUnauth.json();
  console.log('Cuerpo respuesta:', JSON.stringify(dataUnauth));

  console.log('\n=== TEST 3: Acceso con token de usuario común / inválido (GET /api/admin/recipes) ===');
  const resForbidden = await fetch(`${BASE_URL}/api/admin/recipes`, {
    headers: { 'Authorization': 'Bearer token_usuario_comun_12345' }
  });
  console.log(`Status esperado 403: Obtenido ${resForbidden.status}`);
  const dataForbidden = await resForbidden.json();
  console.log('Cuerpo respuesta:', JSON.stringify(dataForbidden));

  console.log('\n=== TEST 4: Login con credencial errónea (POST /api/admin/login) ===');
  const resBadLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'clave_incorrecta', email: 'hacker@test.com' })
  });
  console.log(`Status esperado 401: Obtenido ${resBadLogin.status}`);
  const dataBadLogin = await resBadLogin.json();
  console.log('Cuerpo respuesta:', JSON.stringify(dataBadLogin));

  console.log('\n=== TEST 5: Login con credencial administrativa válida (POST /api/admin/login) ===');
  const resGoodLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'maxmind-admin-2026', email: 'admin@maxsuplementos.com' })
  });
  console.log(`Status esperado 200: Obtenido ${resGoodLogin.status}`);
  const dataGoodLogin = await resGoodLogin.json();
  console.log('Login exitoso:', dataGoodLogin.success);
  console.log('Token recibido es efímero (comienza con adm_):', dataGoodLogin.sessionToken?.startsWith('adm_'));
  console.log('¿Expone ADMIN_SECRET_KEY?:', JSON.stringify(dataGoodLogin).includes('maxmind-admin-2026'));
  const sessionToken = dataGoodLogin.sessionToken;

  console.log('\n=== TEST 6: Creación de Receta con Session Token (POST /api/admin/recipes) ===');
  const testRecipeId = 'rec_test_' + Date.now();
  const resCreate = await fetch(`${BASE_URL}/api/admin/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      id: testRecipeId,
      name: 'Bowl Proteico Test Persistencia',
      protein: 45,
      calories: 480,
      category: 'almuerzo_cena',
      goal: 'hipertrofia',
      country: 'uruguay',
      ingredients: [{ name: 'Lomo magro', quantity: '200g' }]
    })
  });
  console.log(`Status esperado 200: Obtenido ${resCreate.status}`);
  const dataCreate = await resCreate.json();
  console.log('Respuesta creación:', JSON.stringify(dataCreate));

  console.log('\n=== TEST 7: Verificación de receta creada en /api/admin/recipes ===');
  const resVerify = await fetch(`${BASE_URL}/api/admin/recipes`, {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const dataVerify = await resVerify.json();
  const found = dataVerify.recipes.find(r => r.id === testRecipeId);
  console.log(`Receta encontrada en memoria: ${Boolean(found)} (${found?.name})`);

  console.log('\n=== TEST 8: Diagnóstico de Estado y Persistencia (/api/admin/status) ===');
  const resStatus = await fetch(`${BASE_URL}/api/admin/status`, {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const dataStatus = await resStatus.json();
  console.log('Diagnóstico de Persistencia:', JSON.stringify(dataStatus.persistence, null, 2));

  return testRecipeId;
}

runTests().then((id) => {
  console.log('\nID de receta de prueba para verificar tras reinicio:', id);
}).catch(console.error);
