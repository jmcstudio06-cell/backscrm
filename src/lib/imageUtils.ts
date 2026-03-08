/**
 * Utilitários para processamento de imagens
 * Inclui validação de tamanho e compressão otimizada
 */

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB — limite de upload
const MAX_COMPRESSED_SIZE = 1 * 1024 * 1024; // 1 MB — tamanho final após compressão
const AVATAR_MAX_DIMENSION = 600; // pixels (boa qualidade para perfil)
const COMPRESSION_QUALITY = 0.8; // 80% qualidade inicial

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

  if (file.size > MAX_UPLOAD_SIZE) {
    return {
      valid: false,
      error: `Imagem muito grande (${formatFileSize(file.size)}). Máximo permitido: 5 MB.`
    };
  }

  return { valid: true, file };
}

/**
 * Verifica se o navegador suporta WebP
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Comprime uma imagem para o tamanho máximo permitido
 * Otimizado para avatares: 300x300 max, WebP quando suportado, 70% qualidade
 */
export async function compressImage(file: File, maxDimension: number = AVATAR_MAX_DIMENSION): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Redimensionar se necessário (mantendo proporção)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height / width) * maxDimension);
            width = maxDimension;
          } else {
            width = Math.round((width / height) * maxDimension);
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem'));
          return;
        }
        
        // Aplicar suavização para melhor qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Usar WebP se suportado (menor tamanho), senão JPEG
        const useWebP = supportsWebP();
        const mimeType = useWebP ? 'image/webp' : 'image/jpeg';
        const extension = useWebP ? 'webp' : 'jpg';
        
        // Converter para blob com compressão
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao comprimir imagem'));
              return;
            }
            
            // Gerar nome do arquivo com extensão correta
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${baseName}.${extension}`, {
              type: mimeType,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          mimeType,
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
