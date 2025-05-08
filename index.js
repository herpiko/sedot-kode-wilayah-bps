const fs = require('fs');

async function main() {
  const result = {};

  // create new empty file named region-code.sql. If already exist, rewrite it with empty file
  fs.writeFileSync('region-code.sql', 'CREATE TABLE region_codes (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), parent_id VARCHAR(255));\n');
  
  const response = await fetch('https://sig.bps.go.id/rest-drop-down/getwilayah?level=provinsi', {
    method: 'GET'
  });
  const data = await response.json();

  for (let i = 0; i < data.length; i++) {
    const provinceCode = data[i]['kode'];
    console.log(provinceCode);
    result[provinceCode] = {
      id: provinceCode,
      name: data[i]['nama']
    };

    fs.appendFileSync('region-code.sql', `INSERT INTO region_codes (id, name, parent_id) VALUES ('${provinceCode}', '${data[i]['nama']}', '');\n`);

    const responseKabupaten = await fetch('https://sig.bps.go.id/rest-drop-down/getwilayah?level=kabupaten&parent=' + provinceCode, {
      method: 'GET'
    });
    const kabupatenData = await responseKabupaten.json();

    result[provinceCode]['kabupaten'] = [];
    for (let j = 0; j < kabupatenData.length; j++) {
      const kabupatenCode = kabupatenData[j]['kode'];
      console.log(kabupatenCode);
      result[provinceCode]['kabupaten'].push({
        id: kabupatenCode,
        name: kabupatenData[j]['nama']
      });

      fs.appendFileSync('region-code.sql', `INSERT INTO region_codes (id, name, parent_id) VALUES ('${kabupatenCode}', '${kabupatenData[j]['nama']}', '${provinceCode}');\n`);

      result[kabupatenCode] = {
        id: kabupatenCode,
        name: kabupatenData[j]['nama']
      };

      const responseKecamatan = await fetch('https://sig.bps.go.id/rest-drop-down/getwilayah?level=kecamatan&parent=' + kabupatenCode, {
        method: 'GET'
      });
      const kecamatanData = await responseKecamatan.json();

      result[kabupatenCode]['kecamatan'] = [];
      for (let k = 0; k < kecamatanData.length; k++) {
        const kecamatanCode = kecamatanData[k]['kode'];
        console.log(kecamatanCode);
        result[kabupatenCode]['kecamatan'].push({
          id: kecamatanCode,
          name: kecamatanData[k]['nama']
        });


        fs.appendFileSync('region-code.sql', `INSERT INTO region_codes (id, name, parent_id) VALUES ('${kecamatanCode}', '${kecamatanData[k]['nama']}', '${kabupatenCode}');\n`);

        result[kecamatanCode] = {
          id: kecamatanCode,
          name: kecamatanData[k]['nama']
        };

        const responseKelurahan = await fetch('https://sig.bps.go.id/rest-drop-down/getwilayah?level=kelurahan&parent=' + kecamatanCode, {
          method: 'GET'
        });
        const kelurahanData = await responseKelurahan.json();

        result[kecamatanCode]['kelurahan'] = [];
        for (let l = 0; l < kelurahanData.length; l++) {
          const kelurahanCode = kelurahanData[l]['kode'];
          console.log(kelurahanCode);
          result[kecamatanCode]['kelurahan'].push({
            id: kelurahanCode,
            name: kelurahanData[l]['nama']
          });

          fs.appendFileSync('region-code.sql', `INSERT INTO region_codes (id, name, parent_id) VALUES ('${kelurahanCode}', '${kelurahanData[l]['nama']}', '${kecamatanCode}');\n`);

          result[kelurahanCode] = {
            id: kelurahanCode,
            name: kelurahanData[l]['nama']
          };
        }
      }
    }
  }

  const writeFile = util.promisify(fs.writeFile);

  await writeFile('bps-region-code.json', JSON.stringify(result, null, 2));
}

main();
