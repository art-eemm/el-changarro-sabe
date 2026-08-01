import os
from gtts import gTTS

def generate():
    # Target directory under frontend public folder
    target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "demo_audios"))
    os.makedirs(target_dir, exist_ok=True)
    print(f"Generando archivos de audio demo en: {target_dir}")
    
    audios = {
        "dia1.mp3": "Pues hoy estuvo tranquilo, vendí como 20 de rajas y 15 de frijol, el mole casi no se movió, me sobraron como 8. Gasté 180 en gas y 50 en tortillas.",
        "dia2.mp3": "Hoy sí estuvo bueno, se me acabó todo el picadillo bien rápido, tuve que hacer más rajas a medio día porque también se acabaron. El chicharrón otra vez me sobró harto. Gasté 200 en insumos y 40 en bolsas.",
        "dia3.mp3": "Hoy vendí bien los tacos de guisado, se me acabó rapidísimo el de rajas, como siempre. Del de frijol me sobraron unos 15. Gasté 180 en el gas y 40 en bolsas."
    }
    
    for filename, text in audios.items():
        filepath = os.path.join(target_dir, filename)
        print(f"Generando {filename}...")
        # Use gTTS with Mexican Spanish locale for natural accents
        tts = gTTS(text=text, lang="es", tld="com.mx")
        tts.save(filepath)
        print(f"Guardado en {filepath}")

if __name__ == "__main__":
    generate()
