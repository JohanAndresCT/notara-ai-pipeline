# Initial Project Input

## Project Idea

We want to develop an MVP of a web application called **Comunidad Musical**, a community platform and basic sheet-music manager for music students and hobbyist musicians.

Currently there is no simple, accessible space where music students and hobbyists can create, share, and listen to short pieces of sheet music without relying on complex professional notation software (MuseScore, Finale, Sibelius), which has a steep learning curve for someone who just wants to jot down a quick musical idea.

Users would be able to build short sheet music manually (entering notes by hand, as an image upload in this first version), publish it to a shared community feed, and have other musicians listen to it, comment on it, and react to it.

The main idea is to centralize this kind of content in one platform and build the first module (traditional/manual method) of a larger product that, in later phases, will also let users create content through voice (humming a melody) and through image recognition of physical sheet music (OMR), without implementing those methods yet in this MVP.

## Initial Features

Some features we have considered for this MVP (MVP 1 — traditional method) are:

* User registration and authentication (login / logout).
* User profile, showing instrument and published scores.
* Uploading a short sheet music image (jpg or png) and publishing it to the community.
* A dashboard showing the user's own recent scores and the community's recent scores, with the option to filter the feed by instrument.
* Commenting on and reacting ("like") to scores published by others.
* Editing a publication the user owns.
* Deleting a publication the user owns.

These are the features defined for this first MVP; voice-based input and image-recognition (OMR) input are planned as separate future phases (MVP 2 and MVP 3 respectively) and are not part of the current scope.

## Initial Users

We expect the platform to be used by:

* Music students at beginner or intermediate levels, practicing sight-reading and rhythm.
* Hobbyist musicians without constant access to an instructor.
* Music teachers who want to use the tool as a teaching aid or as a repository of exercises for their students.

There is no differentiated role management in this MVP: every registered user can create, publish, comment, and manage only their own content.

## Platform

The initial idea is to develop the product as a web application (responsive).

## Team

* Johan Andrés Ceballos Tabarez — Frontend / UX
* Emanuel Rivas — Backend / Software Architect
* David Urrego — Backend
* Alejandro Rodríguez — Database
* Alejandro Zamorano — Tester / DevOps
