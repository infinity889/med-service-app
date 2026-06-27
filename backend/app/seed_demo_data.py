import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Iterable

from sqlalchemy import select

from app.database.session import AsyncSessionLocal
from app.models.models import Category, Clinic, Price, PriceHistory, Service, ServiceAlias


@dataclass(frozen=True)
class DemoClinic:
    name: str
    slug: str
    city: str
    address: str
    phone: str
    website: str
    latitude: Decimal
    longitude: Decimal


@dataclass(frozen=True)
class DemoService:
    canonical_name: str
    category: str
    base_price: int
    aliases: tuple[str, ...]


CATEGORIES = (
    "Лаборатория",
    "Приём врача",
    "Диагностика",
    "Процедура",
)

CLINICS = (
    DemoClinic(
        name="KDL Olymp",
        slug="kdl-olymp",
        city="Astana",
        address="пр. Мангилик Ел 53",
        phone="+7 (7172) 55-00-00",
        website="https://kdlolymp.kz",
        latitude=Decimal("51.09022100"),
        longitude=Decimal("71.41935600"),
    ),
    DemoClinic(
        name="Invitro Kazakhstan",
        slug="invitro-kazakhstan",
        city="Astana",
        address="ул. Достык 18",
        phone="+7 (7172) 12-34-56",
        website="https://invitro.kz",
        latitude=Decimal("51.12820700"),
        longitude=Decimal("71.43042000"),
    ),
    DemoClinic(
        name="Helix Kazakhstan",
        slug="helix-kazakhstan",
        city="Almaty",
        address="ул. Абая 120",
        phone="+7 (727) 22-33-44",
        website="https://helix.kz",
        latitude=Decimal("43.23894900"),
        longitude=Decimal("76.88970900"),
    ),
    DemoClinic(
        name="Orhun Medical",
        slug="orhun-medical",
        city="Almaty",
        address="ул. Маркова 71",
        phone="+7 (727) 333-22-11",
        website="https://orhunmedical.kz",
        latitude=Decimal("43.22755600"),
        longitude=Decimal("76.91037400"),
    ),
    DemoClinic(
        name="Sunkar",
        slug="sunkar",
        city="Shymkent",
        address="ул. Иляева 15",
        phone="+7 (7252) 55-44-33",
        website="https://sunkar.kz",
        latitude=Decimal("42.31551400"),
        longitude=Decimal("69.58690700"),
    ),
)

SERVICES = (
    DemoService("Общий анализ крови (ОАК)", "Лаборатория", 2500, ("ОАК", "CBC", "Клинический анализ крови")),
    DemoService("Общий анализ мочи", "Лаборатория", 1400, ("ОАМ", "Анализ мочи общий")),
    DemoService("Биохимический анализ крови", "Лаборатория", 8500, ("Биохимия крови", "БАК")),
    DemoService("Глюкоза крови", "Лаборатория", 1200, ("Сахар крови", "Glucose")),
    DemoService("Холестерин общий", "Лаборатория", 1600, ("Общий холестерин", "Cholesterol total")),
    DemoService("АЛТ", "Лаборатория", 1300, ("Аланинаминотрансфераза", "ALT")),
    DemoService("АСТ", "Лаборатория", 1300, ("Аспартатаминотрансфераза", "AST")),
    DemoService("Билирубин общий", "Лаборатория", 1400, ("Общий билирубин", "Bilirubin total")),
    DemoService("Креатинин", "Лаборатория", 1500, ("Creatinine", "Креатинин крови")),
    DemoService("Мочевина", "Лаборатория", 1500, ("Urea", "Мочевина крови")),
    DemoService("ТТГ", "Лаборатория", 3200, ("Тиреотропный гормон", "TSH")),
    DemoService("Т4 свободный", "Лаборатория", 3300, ("Свободный тироксин", "Free T4")),
    DemoService("Ферритин", "Лаборатория", 4200, ("Ferritin", "Ферритин крови")),
    DemoService("Витамин D", "Лаборатория", 7200, ("25-OH витамин D", "Vitamin D")),
    DemoService("С-реактивный белок", "Лаборатория", 2600, ("СРБ", "CRP")),
    DemoService("ПЦР COVID-19", "Лаборатория", 7000, ("COVID PCR", "ПЦР на коронавирус")),
    DemoService("HbA1c", "Лаборатория", 3800, ("Гликированный гемоглобин", "Гемоглобин A1c")),
    DemoService("Коагулограмма", "Лаборатория", 5200, ("Гемостазиограмма", "Анализ свертываемости")),
    DemoService("Прием терапевта", "Приём врача", 6000, ("Консультация терапевта", "Терапевт первичный")),
    DemoService("Прием педиатра", "Приём врача", 6500, ("Консультация педиатра", "Педиатр первичный")),
    DemoService("Прием кардиолога", "Приём врача", 9000, ("Консультация кардиолога", "Кардиолог")),
    DemoService("Прием невролога", "Приём врача", 8500, ("Консультация невролога", "Невропатолог")),
    DemoService("Прием эндокринолога", "Приём врача", 8500, ("Консультация эндокринолога", "Эндокринолог")),
    DemoService("Прием гастроэнтеролога", "Приём врача", 8500, ("Консультация гастроэнтеролога", "Гастроэнтеролог")),
    DemoService("Прием оториноларинголога", "Приём врача", 8000, ("ЛОР", "Консультация ЛОР-врача")),
    DemoService("Прием офтальмолога", "Приём врача", 8000, ("Окулист", "Консультация офтальмолога")),
    DemoService("Прием дерматолога", "Приём врача", 8500, ("Консультация дерматолога", "Дерматовенеролог")),
    DemoService("Прием гинеколога", "Приём врача", 9000, ("Консультация гинеколога", "Гинеколог первичный")),
    DemoService("Прием уролога", "Приём врача", 9000, ("Консультация уролога", "Уролог первичный")),
    DemoService("ЭКГ с расшифровкой", "Диагностика", 3500, ("Электрокардиограмма", "ЭКГ")),
    DemoService("УЗИ брюшной полости", "Диагностика", 7500, ("УЗИ ОБП", "Ультразвук брюшной полости")),
    DemoService("УЗИ щитовидной железы", "Диагностика", 6000, ("УЗИ ЩЖ", "Ультразвук щитовидки")),
    DemoService("УЗИ органов малого таза", "Диагностика", 7500, ("УЗИ ОМТ", "УЗИ малого таза")),
    DemoService("УЗИ сердца", "Диагностика", 12000, ("Эхокардиография", "ЭхоКГ")),
    DemoService("Рентген грудной клетки", "Диагностика", 6500, ("Флюорография", "Рентген ОГК")),
    DemoService("МРТ головного мозга", "Диагностика", 25000, ("МРТ головы", "MRI brain")),
    DemoService("КТ грудной клетки", "Диагностика", 22000, ("КТ ОГК", "CT chest")),
    DemoService("Маммография", "Диагностика", 11000, ("Рентген молочных желез", "Mammography")),
    DemoService("Спирометрия", "Диагностика", 5000, ("ФВД", "Исследование функции дыхания")),
    DemoService("Холтер ЭКГ", "Диагностика", 14000, ("Суточное ЭКГ", "Холтер мониторирование")),
    DemoService("Внутримышечная инъекция", "Процедура", 1200, ("В/м инъекция", "Укол внутримышечно")),
    DemoService("Внутривенная инъекция", "Процедура", 1800, ("В/в инъекция", "Укол внутривенно")),
    DemoService("Капельница", "Процедура", 4500, ("Инфузия", "Внутривенное вливание")),
    DemoService("Перевязка", "Процедура", 3500, ("Смена повязки", "Хирургическая перевязка")),
    DemoService("Забор крови из вены", "Процедура", 1000, ("Венепункция", "Взятие крови")),
    DemoService("Массаж спины", "Процедура", 7000, ("Лечебный массаж спины", "Массаж позвоночника")),
    DemoService("Физиотерапия", "Процедура", 4000, ("ФТЛ", "Физиопроцедура")),
    DemoService("Ингаляция небулайзером", "Процедура", 2500, ("Небулайзер", "Ингаляционная терапия")),
    DemoService("Удаление серной пробки", "Процедура", 5000, ("Промывание уха", "Удаление пробки")),
    DemoService("Вакцинация против гриппа", "Процедура", 6500, ("Прививка от гриппа", "Грипп вакцина")),
)


async def get_or_create_category(db, name: str) -> Category:
    category = await db.scalar(select(Category).where(Category.name == name))
    if category:
        return category

    category = Category(name=name)
    db.add(category)
    await db.flush()
    return category


async def get_or_create_clinic(db, clinic_data: DemoClinic) -> Clinic:
    clinic = await db.scalar(select(Clinic).where(Clinic.slug == clinic_data.slug))
    if clinic:
        clinic.name = clinic_data.name
        clinic.city = clinic_data.city
        clinic.address = clinic_data.address
        clinic.phone = clinic_data.phone
        clinic.website = clinic_data.website
        clinic.latitude = clinic_data.latitude
        clinic.longitude = clinic_data.longitude
        clinic.is_active = True
        return clinic

    clinic = Clinic(**clinic_data.__dict__, is_active=True)
    db.add(clinic)
    await db.flush()
    return clinic


async def get_or_create_service(db, service_data: DemoService, category: Category) -> Service:
    service = await db.scalar(
        select(Service).where(Service.canonical_name == service_data.canonical_name)
    )
    if service:
        service.category_id = category.id
        return service

    service = Service(
        canonical_name=service_data.canonical_name,
        category_id=category.id,
        description=f"Демо-позиция справочника MedServicePrice.kz: {service_data.canonical_name}",
    )
    db.add(service)
    await db.flush()
    return service


async def ensure_aliases(db, service: Service, aliases: Iterable[str]) -> int:
    created = 0
    for alias in aliases:
        existing = await db.scalar(select(ServiceAlias).where(ServiceAlias.alias_name == alias))
        if existing:
            continue

        db.add(ServiceAlias(service_id=service.id, alias_name=alias))
        created += 1
    return created


async def upsert_price(db, clinic: Clinic, service: Service, base_price: int, clinic_index: int) -> tuple[bool, bool]:
    multiplier = Decimal("0.92") + (Decimal(clinic_index) * Decimal("0.055"))
    price_value = (Decimal(base_price) * multiplier).quantize(Decimal("1"))
    source_url = clinic.website

    price = await db.scalar(
        select(Price).where(
            Price.clinic_id == clinic.id,
            Price.service_id == service.id,
        )
    )
    if price:
        changed = price.price != price_value
        if changed:
            db.add(
                PriceHistory(
                    price_id=price.id,
                    old_price=price.price,
                    new_price=price_value,
                )
            )
        price.price = price_value
        price.currency = "KZT"
        price.source_url = source_url
        price.last_updated = datetime.now(timezone.utc)
        price.is_available = True
        return False, changed

    db.add(
        Price(
            clinic_id=clinic.id,
            service_id=service.id,
            price=price_value,
            currency="KZT",
            source_url=source_url,
            last_updated=datetime.now(timezone.utc),
            is_available=True,
        )
    )
    return True, False


async def seed_demo_data() -> None:
    async with AsyncSessionLocal() as db:
        categories = {
            name: await get_or_create_category(db, name)
            for name in CATEGORIES
        }
        clinics = [
            await get_or_create_clinic(db, clinic_data)
            for clinic_data in CLINICS
        ]

        aliases_created = 0
        prices_created = 0
        prices_updated = 0

        for service_data in SERVICES:
            service = await get_or_create_service(
                db,
                service_data,
                categories[service_data.category],
            )

            aliases_created += await ensure_aliases(db, service, service_data.aliases)

            for clinic_index, clinic in enumerate(clinics):
                created, updated = await upsert_price(
                    db,
                    clinic,
                    service,
                    service_data.base_price,
                    clinic_index,
                )
                prices_created += int(created)
                prices_updated += int(updated)

        await db.commit()

    print("Demo data seed completed")
    print(f"Categories: {len(CATEGORIES)}")
    print(f"Clinics/sources: {len(CLINICS)}")
    print(f"Normalized services: {len(SERVICES)}")
    print(f"Aliases created: {aliases_created}")
    print(f"Prices created: {prices_created}")
    print(f"Prices updated: {prices_updated}")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
