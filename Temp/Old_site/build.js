const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Конфигурация по умолчанию
const defaultConfig = {
  language: 'ru',
  title: 'c4m1r',
  keywords: 'personal, homepage',
  description: 'Personal homepage',
  url: 'https://c4m1r.github.io'
};

// Читаем конфигурацию темы
function loadConfig() {
  const configPath = path.join(__dirname, '_config.yml');
  const configContent = fs.readFileSync(configPath, 'utf8');
  const theme = yaml.load(configContent);
  
  return {
    config: defaultConfig,
    theme: theme
  };
}

// Получение значения по пути (например, "theme.sidebar.A1.B1")
function getValueByPath(obj, path) {
  if (!path) return undefined;
  const parts = path.split('.');
  let value = obj;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }
  return value;
}

// Функция для вычисления значения по пути (поддерживает переменные из циклов)
function evaluatePath(pathStr, data) {
  if (!pathStr) return undefined;
  
  // Удаляем лишние пробелы
  pathStr = pathStr.trim();
  
  // Обработка theme.sidebar[c][d][0]
  if (pathStr.includes('[') && pathStr.includes(']')) {
    const baseMatch = pathStr.match(/(theme\.\w+)(\[[^\]]+\])+/);
    if (baseMatch) {
      const [, basePath, indices] = baseMatch;
      let value = getValueByPath(data, basePath);
      
      // Обрабатываем индексы
      const indexMatches = pathStr.match(/\[([^\]]+)\]/g);
      if (indexMatches && value) {
        for (const indexMatch of indexMatches) {
          const index = indexMatch.replace(/[\[\]]/g, '');
          // Проверяем, является ли индекс переменной из data
          if (data[index] !== undefined) {
            value = value[data[index]];
          } else if (!isNaN(index)) {
            value = value[parseInt(index)];
          } else {
            value = value[index];
          }
          if (value === undefined || value === null) break;
        }
      }
      return value;
    }
  }
  
  // Обычный путь
  return getValueByPath(data, pathStr);
}

// Обработка EJS шаблонов
function processEJS(content, data, depth = 0) {
  if (depth > 10) {
    console.warn('Превышена глубина рекурсии при обработке шаблона');
    return content;
  }
  
  let result = content;
  
  // Обработка includes (должно быть первым)
  result = result.replace(/<%- include\(['"]([^'"]+)['"]\) %>/g, (match, includePath) => {
    const fullPath = path.join(__dirname, 'layout', includePath);
    if (fs.existsSync(fullPath)) {
      const includedContent = fs.readFileSync(fullPath, 'utf8');
      return processEJS(includedContent, data, depth + 1);
    }
    return '';
  });
  
  // Обработка вложенных циклов (обрабатываем от внутренних к внешним)
  let changed = true;
  while (changed) {
    changed = false;
    const oldResult = result;
    
    // Обработка циклов <% for (var in obj) { %>
    result = result.replace(/<% for \(([^)]+)\) { %>([\s\S]*?)<% } %>/g, (match, loopVar, content) => {
      const matchVar = loopVar.match(/(\w+)\s+in\s+(.+)/);
      if (!matchVar) return match;
      
      const [, varName, objPath] = matchVar;
      let obj;
      
      // Обработка theme.sidebar[c] или theme.sidebar_color[c]
      if (objPath.includes('[') && objPath.includes(']')) {
        const baseMatch = objPath.match(/(theme\.\w+)\[(\w+)\]/);
        if (baseMatch) {
          const [, basePath, keyVar] = baseMatch;
          const baseObj = getValueByPath(data, basePath);
          // keyVar может быть переменной из внешнего цикла (например, 'c')
          if (baseObj && data[keyVar] !== undefined && baseObj[data[keyVar]]) {
            obj = baseObj[data[keyVar]];
            changed = true;
          } else {
            return '';
          }
        } else {
          return match;
        }
      } else {
        // Обычный путь типа theme.sidebar
        obj = getValueByPath(data, objPath);
        if (obj !== undefined && obj !== null) {
          changed = true;
        } else {
          return match;
        }
      }
      
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        let loopResult = '';
        for (const key in obj) {
          const loopData = {
            ...data,
            [varName]: key
          };
          loopResult += processEJS(content, loopData, depth + 1);
        }
        return loopResult;
      }
      
      return match;
    });
    
    if (result !== oldResult) {
      changed = true;
    }
  }
  
  // Обработка условий <% if (condition) { %>
  // Обрабатываем несколько раз для вложенных условий
  let conditionChanged = true;
  while (conditionChanged) {
    conditionChanged = false;
    const oldResult = result;

    result = result.replace(/<% if \(([^)]+)\) { %>([\s\S]*?)<% } %>/g, (match, condition, content) => {
      let shouldInclude = false;

      // Разбиваем условие на части по &&
      const parts = condition.split('&&').map(p => p.trim());

      for (const part of parts) {
        let partResult = false;

        // Обработка typeof theme.sidebar[c] === 'object'
        if (part.includes('typeof') && (part.includes('===') || part.includes('=='))) {
          const typeofMatch = part.match(/typeof\s+([^\s=]+)\s+===\s+['"]([^'"]+)['"]/) ||
                               part.match(/typeof\s+([^\s=]+)\s+==\s+['"]([^'"]+)['"]/);
          if (typeofMatch) {
            const [, varPath, type] = typeofMatch;
            const value = evaluatePath(varPath.trim(), data);
            partResult = (typeof value === type);
          }
        }
        // Обработка Array.isArray(theme.sidebar[c][d])
        else if (part.includes('Array.isArray')) {
          const arrayMatch = part.match(/Array\.isArray\(([^)]+)\)/);
          if (arrayMatch) {
            const value = evaluatePath(arrayMatch[1].trim(), data);
            partResult = Array.isArray(value);
          }
        }
        // Обработка theme.sidebar[c][d].length >= 2
        else if (part.includes('.length') && (part.includes('>=') || part.includes('>'))) {
          const lengthMatch = part.match(/([^\s]+)\.length\s*>=\s*(\d+)/) ||
                              part.match(/([^\s]+)\.length\s*>\s*(\d+)/);
          if (lengthMatch) {
            const value = evaluatePath(lengthMatch[1].trim(), data);
            partResult = Array.isArray(value) && value.length >= parseInt(lengthMatch[2]);
          }
        }
        // Обработка theme.analysis.platform == "51.la"
        else if (part.includes('==')) {
          const eqMatch = part.match(/([^\s=]+)\s*==\s*['"]([^'"]+)['"]/);
          if (eqMatch) {
            const [, leftPath, rightValue] = eqMatch;
            const leftValue = evaluatePath(leftPath.trim(), data);
            partResult = (String(leftValue) === rightValue);
          } else {
            // Простое сравнение без кавычек
            const parts_split = part.split('==').map(p => p.trim());
            if (parts_split.length === 2) {
              const leftValue = evaluatePath(parts_split[0], data);
              const rightValue = evaluatePath(parts_split[1], data);
              partResult = (leftValue === rightValue);
            }
          }
        }
        // Обработка theme.property
        else if (part.includes('theme.')) {
          const value = evaluatePath(part.trim(), data);
          partResult = (value !== undefined && value !== null && value !== false && value !== '');
        }
        // Обработка простых переменных
        else {
          const value = evaluatePath(part.trim(), data);
          partResult = (value !== undefined && value !== null && value !== false && value !== '');
        }

        if (!partResult) {
          shouldInclude = false;
          break;
        }
        shouldInclude = true;
      }

      if (shouldInclude) {
        conditionChanged = true;
        return processEJS(content, data, depth + 1);
      }
      return '';
    });

    if (result === oldResult) {
      conditionChanged = false;
    }
  }
  
  // Обработка переменных с доступом к массивам theme.sidebar[c][d][0] (вложенные массивы)
  result = result.replace(/<%= theme\.(\w+)\[(\w+)\]\[(\w+)\]\[(\d+)\] %>/g, (match, objName, keyVar1, keyVar2, index) => {
    if (data.theme[objName] && data[keyVar1] && data.theme[objName][data[keyVar1]]) {
      const subObj = data.theme[objName][data[keyVar1]];
      if (data[keyVar2] && subObj[data[keyVar2]] && Array.isArray(subObj[data[keyVar2]])) {
        const arr = subObj[data[keyVar2]];
        return arr[parseInt(index)] || '';
      }
    }
    return '';
  });
  
  // Обработка переменных theme.sidebar[c][d][0] или theme.social[a][0] или theme.sidebar_color[c][1] (массивы в объектах)
  result = result.replace(/<%= theme\.(\w+)\[(\w+)\]\[(\d+)\] %>/g, (match, objName, keyVar, index) => {
    if (data.theme[objName] && data[keyVar] && data.theme[objName][data[keyVar]]) {
      const arr = data.theme[objName][data[keyVar]];
      if (Array.isArray(arr)) {
        return arr[parseInt(index)] || '';
      }
    }
    return '';
  });
  
  // Обработка переменных с квадратными скобками theme.sidebar_color[c][0] - должна быть ПЕРЕД общей обработкой
  result = result.replace(/<%= theme\.(\w+)\[(\w+)\]\[(\d+)\] %>/g, (match, objName, keyVar, index) => {
    if (data.theme[objName] && data[keyVar] && data.theme[objName][data[keyVar]]) {
      const arr = data.theme[objName][data[keyVar]];
      if (Array.isArray(arr)) {
        return arr[parseInt(index)] || '';
      }
    }
    return '';
  });
  
  // Специальная обработка theme.background (массив) - должна быть перед общей обработкой theme
  result = result.replace(/<%= theme\.background %>/g, () => {
    const bg = data.theme.background;
    if (Array.isArray(bg)) {
      return bg.join(',');
    }
    return bg || '';
  });
  
  // Обработка переменных config
  result = result.replace(/<%= config\.(\w+) %>/g, (match, key) => {
    return data.config[key] || '';
  });
  
  // Обработка переменных theme (обычные пути) - должна быть после обработки массивов
  result = result.replace(/<%= theme\.(\w+(?:\.\w+)*(?:\.\w+)*) %>/g, (match, keyPath) => {
    // Пропускаем background, так как он уже обработан
    if (keyPath === 'background') {
      return match; // Вернем как есть, если не обработалось выше
    }
    const value = getValueByPath(data, 'theme.' + keyPath);
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) {
      return value.join(',');
    }
    if (typeof value === 'boolean') {
      return String(value);
    }
    return String(value);
  });
  
  // Обработка простых переменных <%= c %>, <%= d %>, <%= a %>
  result = result.replace(/<%= (\w+) %>/g, (match, varName) => {
    if (data[varName] !== undefined) {
      return String(data[varName]);
    }
    return '';
  });

  // Обработка тернарных операторов <%= condition ? trueValue : falseValue %>
  result = result.replace(/<%= \(([^)]+)\)\s*\?\s*([^:]+)\s*:\s*(.+) %>/g, (match, condition, trueValue, falseValue) => {
    let shouldUseTrue = false;

    // Оцениваем условие
    const conditionParts = condition.split('&&').map(p => p.trim());

    for (const part of conditionParts) {
      let partResult = false;

      if (part.includes('theme.')) {
        const value = evaluatePath(part.trim(), data);
        partResult = (value !== undefined && value !== null && value !== false && value !== '');
      } else {
        const value = evaluatePath(part.trim(), data);
        partResult = (value !== undefined && value !== null && value !== false && value !== '');
      }

      if (!partResult) {
        shouldUseTrue = false;
        break;
      }
      shouldUseTrue = true;
    }

    // Заменяем переменные в true/false значениях
    let resultValue = shouldUseTrue ? trueValue : falseValue;
    resultValue = resultValue.replace(/theme\.(\w+(?:\.\w+)*)/g, (match, path) => {
      const value = getValueByPath(data, 'theme.' + path);
      return value !== undefined ? String(value) : '';
    });

    return resultValue.trim();
  });
  
  // Обработка <%- theme.remark %> (без экранирования)
  result = result.replace(/<%- theme\.(\w+(?:\.\w+)*) %>/g, (match, keyPath) => {
    const value = getValueByPath(data, 'theme.' + keyPath);
    if (value === undefined || value === null) return '';
    return String(value);
  });
  
  // Удаляем все оставшиеся EJS теги (на случай если что-то не обработалось)
  // Делаем это несколько раз для вложенных случаев
  let cleanupChanged = true;
  while (cleanupChanged) {
    const oldResult = result;
    result = result.replace(/<%[^%]*%>/g, '');
    cleanupChanged = (result !== oldResult);
  }
  
  return result;
}

// Копирование директории рекурсивно
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Основная функция сборки
function build() {
  console.log('Начинаем сборку статического сайта...');
  
  // Загружаем конфигурацию
  const data = loadConfig();
  console.log('Конфигурация загружена');
  
  // Создаем директорию public
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });
  
  // Читаем основной шаблон
  const indexTemplate = path.join(__dirname, 'layout', 'index.ejs');
  let html = fs.readFileSync(indexTemplate, 'utf8');
  
  // Обрабатываем шаблон
  console.log('Обрабатываем шаблоны...');
  html = processEJS(html, data);
  
  // Сохраняем index.html
  const indexPath = path.join(publicDir, 'index.html');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('index.html создан');
  
  // Копируем статические ресурсы в правильную структуру
  console.log('Копируем статические ресурсы...');
  const sourceDir = path.join(__dirname, 'source');
  
  // Копируем CSS в /css
  const cssSourceDir = path.join(sourceDir, 'css');
  const cssDestDir = path.join(publicDir, 'css');
  if (fs.existsSync(cssSourceDir)) {
    copyDir(cssSourceDir, cssDestDir);
  }
  
  // Копируем JS в /js
  const jsSourceDir = path.join(sourceDir, 'js');
  const jsDestDir = path.join(publicDir, 'js');
  if (fs.existsSync(jsSourceDir)) {
    copyDir(jsSourceDir, jsDestDir);
  }
  
  // Копируем изображения в /images
  const imagesSourceDir = path.join(sourceDir, 'images');
  const imagesDestDir = path.join(publicDir, 'images');
  if (fs.existsSync(imagesSourceDir)) {
    copyDir(imagesSourceDir, imagesDestDir);
  }
  
  // Копируем шрифты в /fonts
  const fontsSourceDir = path.join(sourceDir, 'fonts');
  const fontsDestDir = path.join(publicDir, 'fonts');
  if (fs.existsSync(fontsSourceDir)) {
    copyDir(fontsSourceDir, fontsDestDir);
  }
  
  // Копируем иконки в /icons
  const iconsSourceDir = path.join(sourceDir, 'icons');
  const iconsDestDir = path.join(publicDir, 'icons');
  if (fs.existsSync(iconsSourceDir)) {
    copyDir(iconsSourceDir, iconsDestDir);
  }
  
  // Копируем JSON файлы
  const jsonSourceDir = path.join(sourceDir, 'json');
  const jsonDestDir = path.join(publicDir, 'json');
  if (fs.existsSync(jsonSourceDir)) {
    copyDir(jsonSourceDir, jsonDestDir);
  }
  
  console.log('Сборка завершена!');
  console.log(`Статический сайт находится в папке: ${publicDir}`);
}

// Запускаем сборку
try {
  build();
} catch (error) {
  console.error('Ошибка при сборке:', error);
  process.exit(1);
}

