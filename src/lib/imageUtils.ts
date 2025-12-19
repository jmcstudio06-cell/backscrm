/**
 * Utilitários para processamento de imagens
 * Inclui validação de tamanho e compressão
 */

const MAX_FILE_SIZE = 500 * 1024; // 500 KB
const MAX_DIMENSION = 400; // pixels
const COMPRESSION_QUALITY = 0.8;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

/**
 * Valida o tamanho do arquivo de imagem
 */
export function validateImageSize(file: File): ImageValidationResult {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Use JPEG, PNG, WebP ou GIF.'
    };
  }

  if (file.size > MAX_FILE_SIZE * 4) {
    return {
      valid: false,
      error: 'Imagem muito grande. Máximo permitido: 2MB antes da compressão.'
    };
  }

  return { valid: true, file };
}

/**
 * Comprime uma imagem para o tamanho máximo permitido
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Redimensionar se necessário
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_DIMENSION;
            width = MAX_DIMENSION;
          } else {
            width = (width / height) * MAX_DIMENSION;
            height = MAX_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob com compressão
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao comprimir imagem'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          COMPRESSION_QUALITY
        );
      };
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Processa uma imagem: valida e comprime se necessário
 */
export async function processImage(file: File): Promise<ImageValidationResult> {
  const validation = validateImageSize(file);
  
  if (!validation.valid) {
    return validation;
  }
  
  try {
    // Sempre comprimir para garantir tamanho otimizado
    const compressedFile = await compressImage(file);
    
    if (compressedFile.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Imagem ainda muito grande após compressão (${Math.round(compressedFile.size / 1024)}KB). Tente uma imagem menor.`
      };
    }
    
    return {
      valid: true,
      file: compressedFile
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erro ao processar imagem'
    };
  }
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
