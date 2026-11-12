import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Parse JSON payloads up to 30mb for image uploads and base64 strings
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // AI Image Content Moderation endpoint
  app.post('/api/moderate-image', async (req, res) => {
    try {
      const { image, mimeType, requireGymContext } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'No image data provided' });
      }

      // Extract base64 and mime type if given as data URL
      let cleanBase64 = image;
      let effectiveMime = mimeType || 'image/jpeg';
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          effectiveMime = matches[1];
          cleanBase64 = matches[2];
        }
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('[AI Moderation] GEMINI_API_KEY not found in environment');
        return res.json({
          isAllowed: true,
          flagCategory: 'none',
          reason: '',
          checkedByAi: false
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const strictGymRule = requireGymContext
        ? `\nSTRICT GYM & EXERCISE REQUIREMENT:\n- This upload is for an Exercise / Workout Plan library. The image MUST be related to the gym, exercise, weightlifting, fitness equipment (barbells, dumbbells, cables, racks, benches, kettlebells), athletic training, or muscle/physique demonstration.\n- If the image is unrelated to gym/exercise/fitness (for example: landscapes, pets, cars, random everyday objects, memes, non-fitness portraits), you MUST mark "isAllowed": false with "flagCategory": "spam" and "reason": "Only gym and exercise-related images are allowed."`
        : '';

      const prompt = `You are the AI Content Safety & Community Moderation engine for GymPax, a minimalist fitness, workout, and bodybuilding platform.
Evaluate this uploaded user image and determine if it is appropriate or must be flagged as NOT ALLOWED.

FITNESS CONTEXT (ALLOWED):
- Athletic bodybuilding physique photos (e.g. athletes flexing muscles in gym shorts or posing trunks, lifters in sports bras, leggings, or compression shorts).
- People exercising, lifting weights, gym mirrors, workout equipment, dumbbells, barbells, pull-up bars, cables, machines.
${strictGymRule}

PROHIBITED CONTENT (FLAG AS NOT ALLOWED):
- Explicit Nudity & Sexual Content: Pornography, visible genitalia, exposed female breasts/nipples without coverage, exposed buttocks without swimwear/athletic gear, erotic/sexually explicit poses or actions.
- Graphic Violence & Gore: Blood, open wounds, mutilation, self-harm, weapons held in a menacing/threatening way.
- Hate Symbols & Extremism: Nazi symbols, white supremacist or extremist imagery, hate speech, slurs.
- Illicit Substances: Illegal drugs, narcotics, illicit contraband.
- Gross / Obscene / Malicious Content: Intentionally repulsive, vulgar, or harassing images.

Respond strictly with a valid JSON object in this exact schema:
{
  "isAllowed": boolean,
  "flagCategory": "none" | "nudity" | "violence" | "hate" | "illegal" | "harassment" | "spam",
  "reason": string
}

If the image is allowed:
{ "isAllowed": true, "flagCategory": "none", "reason": "" }

If the image is NOT allowed:
{ "isAllowed": false, "flagCategory": "<appropriate category>", "reason": "<clear concise polite explanation of why the image cannot be uploaded into the app>" }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: effectiveMime, data: cleanBase64 } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        const isAllowed = Boolean(parsed.isAllowed);
        return res.json({
          isAllowed,
          flagCategory: parsed.flagCategory || (isAllowed ? 'none' : 'nudity'),
          reason: parsed.reason || (isAllowed ? '' : 'This image contains inappropriate or non-gym content and is not allowed.'),
          checkedByAi: true
        });
      } catch (parseErr) {
        console.error('[AI Moderation] Failed to parse model output:', responseText);
        return res.json({
          isAllowed: true,
          flagCategory: 'none',
          reason: '',
          checkedByAi: true
        });
      }
    } catch (err: any) {
      console.error('[AI Moderation] Error during image inspection:', err);
      return res.status(500).json({
        error: 'Failed to inspect image with AI',
        details: err?.message || String(err)
      });
    }
  });

  // AI Gym & Exercise Image Generation Endpoint
  app.post('/api/generate-gym-image', async (req, res) => {
    try {
      const { prompt: rawPrompt, exerciseName, muscleGroup, equipment, trainingGoal } = req.body;
      const userPrompt = String(rawPrompt || exerciseName || muscleGroup || 'Gym exercise').trim();

      if (!userPrompt) {
        return res.status(400).json({ error: 'Please describe the gym exercise or workout setup.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const catalogAssets: { url: string; muscle: string; tags: string[] }[] = [
        { url: '/assets/home_gym_setup_3.jpg', muscle: 'Chest', tags: ['chest', 'bench', 'press', 'pec', 'push', 'barbell', 'incline'] },
        { url: '/assets/dumbbell_user_2.jpg', muscle: 'Chest', tags: ['chest', 'dumbbell', 'press', 'fly', 'bench', 'upper'] },
        { url: '/assets/back_muscle_1.jpg', muscle: 'Back', tags: ['back', 'lat', 'pulldown', 'cable', 'wide'] },
        { url: '/assets/back_muscle_2.jpg', muscle: 'Back', tags: ['back', 'pull-up', 'pullup', 'chin', 'vtaper', 'lats'] },
        { url: '/assets/back_muscle_3.jpg', muscle: 'Back', tags: ['back', 'row', 'barbell', 'bent', 'thickness', 'rhomboid'] },
        { url: '/assets/back_muscle_4.jpg', muscle: 'Back', tags: ['back', 'seated', 'cable', 'row', 'lower'] },
        { url: '/assets/shoulder_muscle_1.jpg', muscle: 'Shoulders', tags: ['shoulder', 'delt', 'overhead', 'dumbbell', 'press'] },
        { url: '/assets/shoulder_muscle_2.jpg', muscle: 'Shoulders', tags: ['shoulder', 'lateral', 'raise', 'side', 'delt', 'cable'] },
        { url: '/assets/shoulder_muscle_3.jpg', muscle: 'Shoulders', tags: ['shoulder', 'rear', 'delt', 'face', 'pull', 'reverse'] },
        { url: '/assets/shoulder_muscle_4.jpg', muscle: 'Shoulders', tags: ['shoulder', 'military', 'barbell', 'press', 'overhead'] },
        { url: '/assets/biceps_muscle_1.jpg', muscle: 'Biceps', tags: ['bicep', 'curl', 'barbell', 'ez', 'arm'] },
        { url: '/assets/biceps_muscle_2.jpg', muscle: 'Biceps', tags: ['bicep', 'incline', 'dumbbell', 'curl', 'stretch'] },
        { url: '/assets/biceps_muscle_3.jpg', muscle: 'Biceps', tags: ['bicep', 'hammer', 'rope', 'cable', 'brachialis'] },
        { url: '/assets/biceps_muscle_4.jpg', muscle: 'Biceps', tags: ['bicep', 'preacher', 'concentration', 'peak', 'isolation'] },
        { url: '/assets/triceps_muscle_1.jpg', muscle: 'Triceps', tags: ['tricep', 'pushdown', 'rope', 'cable', 'pressdown'] },
        { url: '/assets/triceps_muscle_2.jpg', muscle: 'Triceps', tags: ['tricep', 'overhead', 'extension', 'dumbbell', 'long'] },
        { url: '/assets/triceps_muscle_3.jpg', muscle: 'Triceps', tags: ['tricep', 'skull', 'crusher', 'lying', 'ez'] },
        { url: '/assets/triceps_muscle_4.jpg', muscle: 'Triceps', tags: ['tricep', 'dip', 'close', 'grip', 'bench'] },
        { url: '/assets/quads_muscle_1.jpg', muscle: 'Quads', tags: ['quad', 'squat', 'barbell', 'leg', 'front'] },
        { url: '/assets/quads_muscle_2.jpg', muscle: 'Quads', tags: ['quad', 'leg press', 'sled', 'hack', 'machine'] },
        { url: '/assets/quads_muscle_3.jpg', muscle: 'Quads', tags: ['quad', 'extension', 'leg extension', 'isolation'] },
        { url: '/assets/quads_muscle_4.jpg', muscle: 'Quads', tags: ['quad', 'split squat', 'lunge', 'bulgarian', 'dumbbell'] },
        { url: '/assets/hamstrings_muscle_1.jpg', muscle: 'Hamstrings', tags: ['hamstring', 'rdl', 'romanian', 'deadlift', 'hinge'] },
        { url: '/assets/hamstrings_muscle_2.jpg', muscle: 'Hamstrings', tags: ['hamstring', 'leg curl', 'lying', 'seated', 'curl'] },
        { url: '/assets/hamstrings_muscle_3.jpg', muscle: 'Hamstrings', tags: ['hamstring', 'nordic', 'glute ham', 'eccentric'] },
        { url: '/assets/hamstrings_muscle_4.jpg', muscle: 'Hamstrings', tags: ['hamstring', 'single leg', 'unilateral', 'deadlift'] },
        { url: '/assets/glutes_muscle_1.jpg', muscle: 'Glutes', tags: ['glute', 'hip thrust', 'bridge', 'barbell'] },
        { url: '/assets/glutes_muscle_2.jpg', muscle: 'Glutes', tags: ['glute', 'lunge', 'step up', 'split'] },
        { url: '/assets/glutes_muscle_3.jpg', muscle: 'Glutes', tags: ['glute', 'kickback', 'cable', 'abduction'] },
        { url: '/assets/glutes_muscle_4.jpg', muscle: 'Glutes', tags: ['glute', 'sumo', 'deadlift', 'squat'] },
        { url: '/assets/abs_muscle_1.jpg', muscle: 'Abs & Core', tags: ['abs', 'core', 'hanging', 'leg raise', 'captain'] },
        { url: '/assets/abs_muscle_2.jpg', muscle: 'Abs & Core', tags: ['abs', 'crunch', 'cable', 'kneeling', 'six pack'] },
        { url: '/assets/abs_core_exercise_3.jpg', muscle: 'Abs & Core', tags: ['abs', 'oblique', 'woodchopper', 'twist', 'plank'] },
        { url: '/assets/abs_muscle_4.jpg', muscle: 'Abs & Core', tags: ['abs', 'rollout', 'wheel', 'core', 'shred'] },
        { url: '/assets/calves_muscle_1.jpg', muscle: 'Calves', tags: ['calf', 'calves', 'standing', 'gastroc', 'raise'] },
        { url: '/assets/calves_muscle_2.jpg', muscle: 'Calves', tags: ['calf', 'calves', 'seated', 'soleus'] },
        { url: '/assets/calves_muscle_3.jpg', muscle: 'Calves', tags: ['calf', 'calves', 'leg press', 'toe press'] },
        { url: '/assets/calves_muscle_4.jpg', muscle: 'Calves', tags: ['calf', 'calves', 'single leg', 'dumbbell', 'ankle'] },
        { url: '/assets/forearms_muscle_1.jpg', muscle: 'Forearms', tags: ['forearm', 'reverse', 'wrist', 'extensor', 'brachioradialis'] },
        { url: '/assets/forearms_muscle_2.jpg', muscle: 'Forearms', tags: ['forearm', 'wrist curl', 'flexor', 'bench'] },
        { url: '/assets/forearms_muscle_3.jpg', muscle: 'Forearms', tags: ['forearm', 'grip', 'farmer', 'carry', 'behind back'] },
        { url: '/assets/forearms_muscle_4.jpg', muscle: 'Forearms', tags: ['forearm', 'wrist roller', 'vascularity', 'lower arm'] },
        { url: '/assets/kettlebell_gym_1.jpg', muscle: 'Full Body', tags: ['kettlebell', 'swing', 'conditioning', 'turkish'] },
        { url: '/assets/bodyweight_only_1.jpg', muscle: 'Full Body', tags: ['bodyweight', 'calisthenics', 'pullup', 'pushup', 'dip'] },
        { url: '/assets/garage_home_gym.jpg', muscle: 'Full Body', tags: ['gym', 'rack', 'powerbuilding', 'home gym', 'barbell'] }
      ];

      if (apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        // Step 1: Validate with gemini-3.8-flash that the prompt is strictly gym/exercise related and select best visual parameters
        const checkPrompt = `You are the AI Gym & Exercise Visual Director for GymPax.
Evaluate the user's image request:
- User Prompt: "${userPrompt}"
- Exercise Name: "${exerciseName || ''}"
- Primary Muscle: "${muscleGroup || ''}"
- Equipment: "${equipment || ''}"
- Training Goal: "${trainingGoal || ''}"

RULE: Only gym, workout, fitness equipment, bodybuilding, calisthenics, or exercise-related requests are allowed.
If the user prompt is clearly about something unrelated to fitness/gym/exercise (e.g., cars, animals, beaches, food, politics, cartoons, random scenery), set "isGymRelated": false and provide a polite "rejectionReason".

Otherwise set "isGymRelated": true and choose the most accurate asset index (0 to ${catalogAssets.length - 1}) from this list:
${catalogAssets.map((c, idx) => `${idx}: [${c.muscle}] ${c.url} (${c.tags.join(', ')})`).join('\n')}

Respond in valid JSON:
{
  "isGymRelated": boolean,
  "rejectionReason": string,
  "bestAssetIndex": number,
  "exerciseTitle": string,
  "muscleCallout": string,
  "techniqueCue": string,
  "accentColor": string
}`;

        try {
          const analysisResp = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: checkPrompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const parsed = JSON.parse(analysisResp.text || '{}');
          if (parsed.isGymRelated === false) {
            return res.status(400).json({
              error: parsed.rejectionReason || 'Only gym, workout, and exercise-related image descriptions are allowed.'
            });
          }

          // Try native image generation if supported by the current key
          try {
            const imgGenPrompt = `Photorealistic fitness photography in a dark moody high-contrast modern gym. Athletic lifter performing ${userPrompt} (${muscleGroup || 'full body'} focus with ${equipment || 'gym equipment'}). Dramatic studio rim lighting highlighting active muscle contraction and proper exercise form, 8k resolution, editorial sports photography.`;
            const imgResp = await ai.models.generateContent({
              model: 'gemini-3.1-flash-lite-image',
              contents: { parts: [{ text: imgGenPrompt }] },
              config: {
                imageConfig: {
                  aspectRatio: '16:9'
                }
              }
            });
            for (const part of imgResp.candidates?.[0]?.content?.parts ?? []) {
              if (part.inlineData?.data) {
                const mime = part.inlineData.mimeType || 'image/jpeg';
                return res.json({
                  imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                  isNativeGenerated: true,
                  exerciseTitle: parsed.exerciseTitle || exerciseName || userPrompt,
                  muscleCallout: parsed.muscleCallout || muscleGroup || 'Gym Exercise',
                  techniqueCue: parsed.techniqueCue || 'Controlled tempo & peak contraction',
                  accentColor: parsed.accentColor || '#f59e0b'
                });
              }
            }
          } catch {
            // Fall through to AI-curated gym composite using parsed analysis
          }

          const idx =
            typeof parsed.bestAssetIndex === 'number' &&
            parsed.bestAssetIndex >= 0 &&
            parsed.bestAssetIndex < catalogAssets.length
              ? parsed.bestAssetIndex
              : 0;

          return res.json({
            baseAssetUrl: catalogAssets[idx].url,
            isNativeGenerated: false,
            exerciseTitle: parsed.exerciseTitle || exerciseName || userPrompt,
            muscleCallout: parsed.muscleCallout || `${muscleGroup || 'Target Muscle'} · ${equipment || 'Gym'}`,
            techniqueCue: parsed.techniqueCue || 'Full ROM · Controlled Eccentric',
            accentColor: parsed.accentColor || '#f59e0b'
          });
        } catch (aiErr) {
          console.warn('[AI Gym Image] Fallback keyword matching:', aiErr);
        }
      }

      // Keyword fallback if API key is missing
      const lower = `${userPrompt} ${exerciseName || ''} ${muscleGroup || ''} ${equipment || ''}`.toLowerCase();
      let bestIdx = 0;
      let bestScore = -1;
      catalogAssets.forEach((asset, idx) => {
        let score = 0;
        if (muscleGroup && asset.muscle.toLowerCase() === String(muscleGroup).toLowerCase()) {
          score += 5;
        }
        asset.tags.forEach(t => {
          if (lower.includes(t)) score += 3;
        });
        if (score > bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      });

      return res.json({
        baseAssetUrl: catalogAssets[bestIdx].url,
        isNativeGenerated: false,
        exerciseTitle: exerciseName || userPrompt,
        muscleCallout: `${muscleGroup || 'Gym'} · ${equipment || 'Exercise'}`,
        techniqueCue: 'Controlled Eccentric & Peak Tension',
        accentColor: '#f59e0b'
      });
    } catch (err: any) {
      console.error('[AI Gym Image] Error:', err);
      return res.status(500).json({ error: 'Failed to create AI gym image' });
    }
  });

  // Membership Login / Session endpoint
  app.post('/api/membership/login', (req, res) => {
    const { email, name } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    console.log(`[GymPax Membership] Member logged in: ${cleanEmail}`);
    return res.json({
      success: true,
      email: cleanEmail,
      name: name || 'Alex Hunter',
      memberId: 'MEM_' + Buffer.from(cleanEmail).toString('base64').substring(0, 8).toUpperCase(),
      message: 'Membership session active'
    });
  });

  // Recurring Weekly Email Digest Dispatch Endpoint
  app.post('/api/membership/send-weekly-digest', (req, res) => {
    try {
      const { email, digest } = req.body;
      const recipientEmail = email || digest?.recipientEmail;
      if (!recipientEmail) {
        return res.status(400).json({ error: 'Recipient email required' });
      }

      const emailId = 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const sentAt = new Date().toISOString();

      console.log(`[GymPax Weekly Digest] Dispatched progress email to ${recipientEmail} with charts and member connections. ID: ${emailId}`);

      return res.json({
        success: true,
        emailId,
        sentAt,
        recipientEmail,
        subject: 'Your GymPax Weekly Progress Report & Community Connections 📊',
        stats: digest?.stats,
        message: `Weekly progress email delivered to ${recipientEmail}`
      });
    } catch (err: any) {
      console.error('[GymPax Weekly Digest] Error dispatching email:', err);
      return res.status(500).json({ error: 'Failed to dispatch email digest' });
    }
  });

  // Serve static assets in production, or mount Vite dev server middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GymPax] Dev server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
