      // CSVを解析する。引用符内のカンマにも対応。
    function parseCSV(text) {
      const rows = [];
      let row = [];
      let field = "";
      let quoted = false;

      text = text.replace(/^\uFEFF/, "");

      for (let i = 0; i < text.length; i++) {
        const c = text[i];

        if (quoted) {
          if (c === '"' && text[i + 1] === '"') {
            field += '"';
            i++;
          } else if (c === '"') {
            quoted = false;
          } else {
            field += c;
          }
        } else if (c === '"' && field === "") {
          quoted = true;
        } else if (c === ",") {
          row.push(field);
          field = "";
        } else if (c === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
        } else if (c !== "\r") {
          field += c;
        }
      }

      if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
      }

      const headers = rows.shift();

      return rows
        .filter(r => r.some(v => v.trim() !== ""))
        .map(r => {
          const item = {};
          headers.forEach((header, i) => {
            item[header.trim()] = (r[i] || "").trim();
          });
          return item;
        });
    }
