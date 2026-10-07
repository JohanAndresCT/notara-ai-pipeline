# Release Plan — Comunidad Musical

**MVP 1 · Sprint único · 2 semanas**  
**Fecha de inicio:** 1 de octubre de 2026 | **Fecha de entrega:** 13 de octubre de 2026

## 1. Resumen general del release plan

| Release | Duración | Sprints | Objetivo funcional |
|---|---|---:|---|
| MVP 1 — Notara | 2 semanas (30 de septiembre–13 de octubre de 2026) | 1 sprint | Habilitar registro, autenticación, creación y gestión de partituras textuales, además de exploración e interacción comunitaria básica. |

## 2. Detalle de épicas

### E01 — ACCESS

**Descripción:** Agrupa todas las funcionalidades relacionadas con el acceso y la identidad del usuario en la plataforma.  
**Objetivo de negocio:** Permitir que cualquier músico pueda crear su cuenta, iniciar sesión y gestionar su perfil personal.  
**Historias asociadas:** HU01, HU02, HU03

### E02 — CONTENT

**Descripción:** Agrupa las funcionalidades de creación, publicación y gestión del contenido musical propio.  
**Objetivo de negocio:** Permitir que el usuario publique, edite y elimine sus partituras en formato textual dentro de la comunidad.
**Historias asociadas:** HU04, HU05, HU06

### E03 — COMMUNITY

**Descripción:** Agrupa las funcionalidades de exploración del contenido comunitario e interacción social.  
**Objetivo de negocio:** Ofrecer un espacio donde los usuarios descubran partituras de otros, reaccionen y comenten para fomentar el intercambio musical.  
**Historias asociadas:** HU07, HU08, HU09, HU10

## 3. Plan de sprints

| Sprint | Historias incluidas | Story Points totales | Objetivo del sprint |
|---|---|---:|---|
| Sprint 1 — 1 al 13 de octubre de 2026 | HU01, HU02, HU03, HU04, HU05, HU06, HU07, HU08, HU09, HU10 | 31 | Entregar el MVP completo: acceso de usuarios, creación y gestión de partituras e interacción comunitaria básica. |

## 4. Fichas técnicas de historias de usuario

### HU01 — Registro de usuario

**Épica:** ACCESS

**Como** músico visitante  
**Quiero** registrarme en la plataforma ingresando mis datos básicos (nombre, correo y contraseña)  
**Para** crear mi cuenta y acceder al sistema como usuario autenticado.

#### Criterios de aceptación

1. **Dado** que soy visitante, **cuando** completo el formulario con nombre, correo y contraseña válidos y envío el formulario, **entonces** se crea mi cuenta y soy redirigido a la pantalla de inicio.
2. **Dado** que soy visitante, **cuando** ingreso un correo ya registrado, **entonces** el sistema me notifica que ese correo ya existe y no crea una cuenta duplicada.
3. **Dado** que soy visitante, **cuando** dejo campos obligatorios vacíos o ingreso una contraseña menor a 8 caracteres, **entonces** el sistema muestra mensajes de error claros sin crear la cuenta.

#### Definition of Done (DoD)

- [ ] El usuario puede registrarse y acceder a su sesión sin errores.
- [ ] Los correos duplicados son rechazados con un mensaje claro.
- [ ] Las validaciones de campos vacíos e inválidos funcionan correctamente.
- [ ] El flujo de registro fue probado en dispositivos móviles y de escritorio.
- [ ] Revisión y aprobación del Product Owner completada.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 3 | Must Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | Johan Andrés Ceballos | Emanuel Rivas |

**Justificación MoSCoW:** Sin registro no hay plataforma. Es un prerrequisito absoluto para cualquier funcionalidad.  
**Motivo del desarrollo de apoyo:** Mantener la coherencia entre el formulario de registro y la gestión de sesión del sistema.

### HU02 — Login y logout de usuario

**Épica:** ACCESS

**Como** usuario registrado  
**Quiero** iniciar y cerrar sesión en la plataforma  
**Para** acceder de forma segura a mis funcionalidades y proteger mi cuenta al salir.

#### Criterios de aceptación

1. **Dado** que soy usuario registrado, **cuando** ingreso mis credenciales correctas, **entonces** accedo a mi dashboard personal.
2. **Dado** que soy usuario registrado, **cuando** ingreso credenciales incorrectas, **entonces** el sistema muestra un mensaje de error y no permite el acceso.
3. **Dado** que estoy autenticado, **cuando** selecciono la opción “Cerrar sesión”, **entonces** mi sesión finaliza y soy redirigido a la pantalla de inicio pública.

#### Definition of Done (DoD)

- [ ] El login con credenciales válidas funciona correctamente.
- [ ] Las credenciales inválidas muestran un mensaje de error sin revelar información sensible.
- [ ] El logout limpia completamente la sesión activa.
- [ ] El flujo fue verificado en dispositivos móviles.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 2 | Must Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | Johan Andrés Ceballos | Emanuel Rivas |

**Justificación MoSCoW:** El login es la puerta de entrada a todas las funcionalidades del MVP.  
**Motivo del desarrollo de apoyo:** Integrar el flujo de autenticación con la lógica de sesión del sistema.

### HU03 — Gestión de perfil de usuario

**Épica:** ACCESS

**Como** usuario autenticado  
**Quiero** ver y actualizar la información de mi perfil (nombre de usuario, nombre, descripción e instrumento principal), además de cambiar mi contraseña
**Para** personalizar mi identidad dentro de la comunidad musical.

#### Criterios de aceptación

1. **Dado** que estoy autenticado, **cuando** accedo a “Mi perfil”, **entonces** veo mis datos actuales: nombre de usuario, nombre, descripción e instrumento principal.
2. **Dado** que estoy en mi perfil, **cuando** actualizo mi nombre de usuario, nombre, descripción o instrumento y guardo los cambios, **entonces** los cambios se reflejan inmediatamente.
3. **Dado** que estoy autenticado, **cuando** ingreso mi contraseña actual y una nueva contraseña válida, **entonces** el sistema actualiza mi contraseña y confirma el cambio.
4. **Dado** que intento cambiar la contraseña usando una contraseña actual incorrecta o una nueva contraseña inválida, **entonces** el sistema rechaza el cambio y muestra un mensaje de validación claro.

#### Definition of Done (DoD)

- [ ] El usuario puede ver y editar nombre de usuario, nombre, descripción e instrumento.
- [ ] El usuario puede cambiar su contraseña validando la contraseña actual.
- [ ] Los cambios persisten y se reflejan en el perfil.
- [ ] El flujo fue validado en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 2 | Should Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | Johan Andrés Ceballos | Alejandro Rodríguez |

**Justificación MoSCoW:** Mejora la identidad del usuario dentro de la comunidad; no bloquea el MVP, pero enriquece la experiencia.  
**Motivo del desarrollo de apoyo:** Persistencia y consulta de los datos del perfil del usuario.

### HU04 — Creación y publicación de partitura

**Épica:** CONTENT

**Como** usuario autenticado  
**Quiero** crear o enviar una partitura en formato `.abc` o texto plano, asignarle un título, instrumento y descripción, y publicarla en la comunidad
**Para** compartir mi creación musical con otros usuarios.

#### Criterios de aceptación

1. **Dado** que estoy autenticado, **cuando** ingreso o envío contenido en formato `.abc` o texto plano, completo el título, instrumento y descripción, y publico, **entonces** la partitura aparece en el feed de la comunidad.
2. **Dado** que envío una partitura, **cuando** el contenido está vacío o supera los 1.000 caracteres, **entonces** el sistema rechaza la publicación y muestra un mensaje de validación.
3. **Dado** que envío contenido `.abc`, **cuando** no cumple la validación básica de sintaxis ABC, **entonces** el sistema rechaza la publicación e indica el error correspondiente.
4. **Dado** que intento enviar un formato distinto de `.abc` o texto plano, **entonces** el sistema rechaza la publicación e indica los formatos válidos.
5. **Dado** que dejo vacío el título, instrumento, contenido textual o descripción, **entonces** el sistema no permite la publicación y muestra el error correspondiente.

#### Definition of Done (DoD)

- [ ] La partitura publicada aparece en el feed comunitario.
- [ ] Se aceptan `.abc` y texto plano, y se rechazan otros formatos.
- [ ] El contenido no está vacío y no supera los 1.000 caracteres.
- [ ] El contenido `.abc` pasa una validación básica de sintaxis.
- [ ] El texto plano se acepta con formato libre.
- [ ] Los campos obligatorios (título, instrumento, contenido y descripción) se validan antes de publicar.
- [ ] El contenido se muestra conservando los saltos de línea y distinguiendo su formato.
- [ ] El flujo completo fue probado en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 5 | Must Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | David Urrego | Alejandro Rodríguez |

**Justificación MoSCoW:** Es la función central del MVP: sin publicación de partituras la plataforma no existe.  
**Motivo del desarrollo de apoyo:** Almacenamiento y consulta del contenido textual y los metadatos de las partituras.

### HU05 — Edición de partitura propia

**Épica:** CONTENT

**Como** usuario autenticado  
**Quiero** editar el título, la descripción o el instrumento de una partitura que publiqué  
**Para** corregir o actualizar la información de mi contenido.

#### Criterios de aceptación

1. **Dado** que soy el autor de una partitura, **cuando** edito el título, descripción o instrumento y guardo, **entonces** los cambios se reflejan en el feed y en el detalle.
2. **Dado** que intento editar una partitura de otro usuario, **entonces** la opción de edición no está disponible para mí.
3. **Dado** que dejo el título vacío al editar, **entonces** el sistema no guarda el cambio y muestra un error.

#### Definition of Done (DoD)

- [ ] Solo el autor puede editar su partitura.
- [ ] Los cambios guardados se reflejan inmediatamente.
- [ ] Los campos obligatorios se validan correctamente.
- [ ] La funcionalidad fue probada en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 3 | Must Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | David Urrego | Johan Andrés Ceballos |

**Justificación MoSCoW:** Permite al usuario corregir errores y mantener la calidad de su contenido publicado.  
**Motivo del desarrollo de apoyo:** Actualización del formulario de edición en la interfaz de usuario.

### HU06 — Eliminación de partitura propia

**Épica:** CONTENT

**Como** usuario autenticado  
**Quiero** eliminar una partitura que publiqué  
**Para** retirar de la comunidad contenido que ya no deseo compartir.

#### Criterios de aceptación

1. **Dado** que soy el autor, **cuando** selecciono “Eliminar” en una de mis partituras y confirmo, **entonces** la partitura desaparece del feed y del detalle.
2. **Dado** que intento eliminar una partitura ajena, **entonces** la opción de eliminar no está disponible.
3. **Dado** que selecciono “Eliminar”, **cuando** aparece la confirmación y la cancelo, **entonces** la partitura no se elimina.

#### Definition of Done (DoD)

- [ ] Solo el autor puede eliminar su partitura.
- [ ] Se solicita confirmación antes de eliminar.
- [ ] La partitura eliminada desaparece del feed.
- [ ] La funcionalidad fue probada en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 2 | Must Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | David Urrego | Alejandro Rodríguez |

**Justificación MoSCoW:** Control básico del contenido: el usuario debe poder eliminar lo que publicó.  
**Motivo del desarrollo de apoyo:** Eliminación segura del registro en la base de datos.

### HU07 — Dashboard

**Épica:** COMMUNITY

**Como** usuario autenticado  
**Quiero** ver un dashboard que muestre mis partituras recientes y las partituras recientes de la comunidad, con la opción de filtrar por instrumento  
**Para** tener una visión rápida de mi actividad y de la comunidad musical.

#### Criterios de aceptación

1. **Dado** que estoy autenticado, **cuando** accedo al dashboard, **entonces** veo mis últimas partituras publicadas y las últimas de la comunidad.
2. **Dado** que selecciono un instrumento en el filtro, **entonces** el feed solo muestra partituras de ese instrumento.
3. **Dado** que aún no he publicado partituras, **entonces** el dashboard muestra un mensaje invitándome a crear mi primera partitura.

#### Definition of Done (DoD)

- [ ] El dashboard muestra correctamente partituras propias y comunitarias.
- [ ] El filtro por instrumento funciona sin recargar la página.
- [ ] Se muestra un mensaje de estado vacío cuando no hay partituras.
- [ ] La carga responsive fue validada en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 5 | Must Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | Johan Andrés Ceballos | David Urrego |

**Justificación MoSCoW:** El dashboard es el centro de navegación del MVP; sin él el usuario no tiene un punto de entrada.  
**Motivo del desarrollo de apoyo:** Consultas de partituras propias y comunitarias con soporte de filtros.

### HU08 — Exploración del feed y detalle de partitura

**Épica:** COMMUNITY

**Como** usuario autenticado  
**Quiero** explorar el feed de partituras publicadas por otros usuarios y ver el detalle de cualquier partitura  
**Para** descubrir nuevo contenido musical y conocer su información completa.

#### Criterios de aceptación

1. **Dado** que accedo al feed, **cuando** desplazo la lista, **entonces** veo las partituras de la comunidad ordenadas por fecha de publicación, de más recientes a más antiguas.
2. **Dado** que selecciono una partitura del feed, **entonces** se abre una vista de detalle con el contenido textual legible, sus saltos de línea, formato (`.abc` o texto plano), título, instrumento, descripción, autor y comentarios.
3. **Dado** que el feed está vacío, **entonces** el sistema muestra un mensaje indicando que aún no hay contenido publicado.

#### Definition of Done (DoD)

- [ ] El feed carga correctamente las partituras ordenadas por fecha.
- [ ] La vista de detalle muestra todos los campos requeridos.
- [ ] El estado vacío se maneja con un mensaje amigable.
- [ ] La funcionalidad fue validada en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 3 | Must Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | Johan Andrés Ceballos | Alejandro Rodríguez |

**Justificación MoSCoW:** Permite ver el detalle de cada partitura y constituye la base de la interacción social del MVP.  
**Motivo del desarrollo de apoyo:** Consultas ordenadas del feed y recuperación del detalle de la partitura.

### HU09 — Reacción a partituras

**Épica:** COMMUNITY

**Como** usuario autenticado  
**Quiero** reaccionar a una partitura publicada por otro usuario, por ejemplo, con “Me gusta”  
**Para** expresar mi apreciación hacia el contenido de la comunidad.

#### Criterios de aceptación

1. **Dado** que estoy en el detalle de una partitura ajena, **cuando** hago clic en el botón de reacción, **entonces** el contador aumenta y mi reacción queda registrada.
2. **Dado** que ya reaccioné a una partitura, **cuando** vuelvo a hacer clic en el botón, **entonces** mi reacción se retira y el contador disminuye.
3. **Dado** que soy el autor de la partitura, **entonces** no puedo reaccionar a mi propio contenido.

#### Definition of Done (DoD)

- [ ] La reacción se registra y se refleja en el contador en tiempo real.
- [ ] El retiro de la reacción funciona correctamente.
- [ ] El autor no puede reaccionar a su propio contenido.
- [ ] La funcionalidad fue probada en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 3 | Should Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | David Urrego | Johan Andrés Ceballos |

**Justificación MoSCoW:** Las reacciones fomentan el engagement comunitario; no son bloqueantes del MVP, pero añaden valor social.  
**Motivo del desarrollo de apoyo:** Representación visual del estado de la reacción en la interfaz.

### HU10 — Comentarios en partituras

**Épica:** COMMUNITY

**Como** usuario autenticado  
**Quiero** escribir un comentario en una partitura publicada por otro usuario  
**Para** compartir retroalimentación o iniciar un intercambio musical con el autor y la comunidad.

#### Criterios de aceptación

1. **Dado** que estoy en el detalle de una partitura, **cuando** escribo un comentario no vacío y lo envío, **entonces** el comentario aparece en la sección de comentarios con mi nombre y la fecha.
2. **Dado** que intento enviar un comentario vacío, **entonces** el sistema no permite el envío y muestra un mensaje de validación.
3. **Dado** que soy el autor de un comentario, **cuando** selecciono eliminar mi comentario y confirmo, **entonces** el comentario desaparece de la sección.

#### Definition of Done (DoD)

- [ ] Los comentarios se publican y muestran con nombre de autor y fecha.
- [ ] Los comentarios vacíos son rechazados.
- [ ] El autor puede eliminar su propio comentario.
- [ ] La sección de comentarios fue validada en móvil y escritorio.
- [ ] Aprobación del Product Owner.

| Story Points | MoSCoW | Clasificación IA | Release / Sprint | Dev. principal | Dev. apoyo |
|---:|---|---|---|---|---|
| 3 | Should Have | 0/5 — Tradicional | MVP 1 / Sprint 1 | David Urrego | Alejandro Rodríguez |

**Justificación MoSCoW:** Los comentarios potencian el intercambio musical; complementan el MVP sin ser un bloqueante.  
**Motivo del desarrollo de apoyo:** Persistencia y consulta de comentarios asociados a partituras.

## 5. Detalle de evaluación de IA por historia

| HU | Datos no estructurados | Patrones / predicción | Lenguaje natural | Personalización | Probabilístico | Puntaje | Clasificación |
|---|---|---|---|---|---|---:|---|
| HU01 | No | No | No | No | No | 0 | Tradicional |
| HU02 | No | No | No | No | No | 0 | Tradicional |
| HU03 | No | No | No | No | No | 0 | Tradicional |
| HU04 | No | No | No | No | No | 0 | Tradicional |
| HU05 | No | No | No | No | No | 0 | Tradicional |
| HU06 | No | No | No | No | No | 0 | Tradicional |
| HU07 | No | No | No | No | No | 0 | Tradicional |
| HU08 | No | No | No | No | No | 0 | Tradicional |
| HU09 | No | No | No | No | No | 0 | Tradicional |
| HU10 | No | No | No | No | No | 0 | Tradicional |

## 6. Distribución de carga del equipo

| Desarrollador | Rol | Principal | Apoyo | Total | % de carga | Validación |
|---|---|---:|---:|---:|---:|---|
| Johan Andrés Ceballos | Frontend | 5 | 2 | 7 | 35% | OK |
| Emanuel Rivas | Backend / Arquitecto | 0 | 2 | 2 | 10% | OK |
| David Urrego | Backend | 5 | 1 | 6 | 30% | OK |
| Alejandro Rodríguez | Base de datos | 0 | 5 | 5 | 25% | OK |
| Alejandro Zamorano | Tester / Despliegue | 0 | 0 | 0 | 0% | OK |

## 7. Validación final de control

- [x] Todas las historias pertenecen a una épica.
- [x] Todos los IDs son únicos (HU01–HU10).
- [x] Todas las historias están asignadas al Sprint 1 del MVP 1.
- [x] Cada historia expresa claramente el “qué” y el “para qué”.
- [x] Cada historia contiene criterios de aceptación y DoD.
- [x] Las dependencias funcionales respetan el orden de implementación.
- [x] Los Story Points usan exclusivamente la escala de Fibonacci.
- [x] El puntaje de IA está asignado solo a historias individuales, no a épicas.
- [x] La cobertura total del equipo está garantizada.
- [x] Ninguna historia contiene detalles técnicos o arquitectónicos internos.
- [x] No se generaron funcionalidades fuera del alcance definido.

## 8. Sugerencias

1. **CONTENT — HU04:** El MVP 1 permite visualizar el contenido textual, pero no incluye reproducción ni compartición de audio. Cualquier capacidad de audio requiere una decisión y alcance futuros.
2. **COMMUNITY — HU07 (Dashboard):** En un próximo incremento se podría agregar ordenamiento del feed por popularidad (reacciones), además del orden actual por fecha.
3. **ACCESS — HU01:** Considerar añadir verificación de correo electrónico en el MVP 2 para fortalecer la confianza de la comunidad.
4. **General — Equipo:** Alejandro Zamorano (Tester / Despliegue) tiene una carga baja en asignaciones de historias; se sugiere que lidere las pruebas de aceptación end-to-end y el proceso de despliegue del MVP sin que esto se refleje en el release plan como una historia formal.
