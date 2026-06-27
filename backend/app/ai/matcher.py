import logging
from typing import List, Optional
from uuid import UUID
from app.models.models import Service
from app.config.settings import settings

try:
    from rapidfuzz import process, fuzz
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False
    process = None
    fuzz = None

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

logger = logging.getLogger(__name__)

class MatchingResult:
    def __init__(self, action: str, service_id: Optional[UUID] = None, similarity: float = 0.0):
        self.action = action # 'EXACT_MATCH', 'NEEDS_REVIEW', 'NEW_SERVICE'
        self.service_id = service_id
        self.similarity = similarity

class AIMatcher:
    def __init__(self):
        self.client = None
        if GROQ_AVAILABLE and settings.GROQ_API_KEY:
            self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def match(self, raw_name: str, existing_services: List[Service]) -> MatchingResult:
        if not existing_services:
            return MatchingResult('NEW_SERVICE')

        canonical_names = {s.canonical_name: s.id for s in existing_services}
        names_list = list(canonical_names.keys())

        # 1. RapidFuzz matching (Get top candidates)
        best_fuzz = None
        top_matches = []
        if RAPIDFUZZ_AVAILABLE and process and fuzz:
            top_matches = process.extract(raw_name, names_list, scorer=fuzz.WRatio, limit=5)
            if top_matches:
                best_fuzz = top_matches[0]
                score = best_fuzz[1]
                matched_name = best_fuzz[0]
                
                # If almost exact match, return immediately
                if score >= 95.0:
                    return MatchingResult('EXACT_MATCH', canonical_names[matched_name], score)

        # 2. Semantic Analysis with Groq AI
        if self.client and top_matches:
            candidates_text = "\n".join([f"- {m[0]}" for m in top_matches])
            prompt = f"""You are a medical data assistant. We have a raw service name from a messy price list, and a list of standard canonical services.
Raw name: "{raw_name}"

Candidates:
{candidates_text}

Does the raw name mean exactly the same medical procedure as one of the candidates? 
If yes, reply with ONLY the exact name of the candidate from the list. Do not add any other words.
If no, reply with the word "NEW".
"""
            try:
                response = await self.client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama-3.1-8b-instant", # Быстрая модель
                    temperature=0.0,
                    max_tokens=50
                )
                answer = response.choices[0].message.content.strip()
                
                if answer in canonical_names:
                    # Groq выбрал один из вариантов
                    return MatchingResult('NEEDS_REVIEW', canonical_names[answer], 90.0)
            except Exception as e:
                logger.error(f"Groq API error: {e}")

        # Fallback к RapidFuzz
        if best_fuzz and best_fuzz[1] >= 85.0:
            return MatchingResult('NEEDS_REVIEW', canonical_names[best_fuzz[0]], best_fuzz[1])

        return MatchingResult('NEW_SERVICE')

ai_matcher = AIMatcher()
